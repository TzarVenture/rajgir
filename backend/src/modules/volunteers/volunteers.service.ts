import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { INCIDENT_STATUSES, isVolunteerCheckInOpen } from '../../common/constants/event';
import { IDENTITY_SELECT, UsersService, displayName, withIdentity } from '../users/users.service';
import { CreateVolunteerDto } from './dto/create-volunteer.dto';
import {
  AssignVolunteerDto,
  ChecklistItemDto,
  CreateIncidentDto,
  DutyStatusDto,
  GeoDto,
  UpdateIncidentDto,
} from './dto/volunteer-ops.dto';

const MAX_CHECKLIST_ITEMS = 100;

@Injectable()
export class VolunteersService {
  private readonly logger = new Logger(VolunteersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly users: UsersService,
  ) {}

  /**
   * Register the signed-in user as a volunteer (waits for approval).
   * Identity comes from the account; eligibility, profile and role change are one transaction.
   */
  async registerVolunteer(userId: string, dto: CreateVolunteerDto) {
    if (!dto.waiverAgreed) throw new BadRequestException('You must accept the volunteer waiver to register.');

    try {
      const { profile: record, user } = await this.users.createRoleProfile(userId, Role.VOLUNTEER, 'PENDING_APPROVAL', (tx) =>
        tx.volunteer.create({
          data: {
            userId,
            tShirtSize: dto.tShirtSize,
            emergencyContactName: dto.emergencyContactName.trim(),
            emergencyContactPhone: dto.emergencyContactPhone.trim(),
            availability: dto.availability || [],
            rolePreference: dto.rolePreference,
            languagesSpoken: dto.languagesSpoken?.trim() || null,
            dietaryRestrictions: dto.dietaryRestrictions?.trim() || null,
            medicalCertification: dto.medicalCertification || false,
            waiverAgreed: true,
            status: 'pending',
          },
        }),
      );

      this.logger.log(`Volunteer registered: ${record.id} (user ${userId})`);
      return {
        success: true,
        id: record.id,
        fullName: displayName(user),
        email: user.email,
        rolePreference: record.rolePreference,
        status: record.status,
        submittedAt: record.submittedAt,
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('You have already submitted this registration.');
      }
      throw error;
    }
  }

  async listVolunteers(limit = 50, offset = 0) {
    const [total, rows] = await Promise.all([
      this.prisma.volunteer.count(),
      this.prisma.volunteer.findMany({
        take: limit,
        skip: offset,
        orderBy: { submittedAt: 'desc' },
        include: { user: { select: IDENTITY_SELECT } },
      }),
    ]);
    const volunteers = rows.map(withIdentity);
    return { total, count: volunteers.length, volunteers };
  }

  // ---------- Volunteer self-service (dashboard) ----------

  /** The signed-in user's volunteer profile, read together with their identity (from users). */
  private async findMine(userId: string) {
    const row = await this.prisma.volunteer.findUnique({ where: { userId }, include: { user: { select: IDENTITY_SELECT } } });
    if (!row) throw new NotFoundException('You do not have a volunteer registration.');
    return withIdentity(row);
  }

  /** Operational actions are only for volunteers the organizers have approved. */
  private async findApproved(userId: string) {
    const volunteer = await this.findMine(userId);
    if (volunteer.status !== 'approved') {
      throw new ForbiddenException('Your volunteer application has not been approved yet.');
    }
    return volunteer;
  }

  private openShift(volunteerId: string) {
    return this.prisma.volunteerAttendance.findFirst({ where: { volunteerId, checkOutAt: null } });
  }

  /** Incidents the volunteer reported, plus anything logged at their assigned station. */
  private incidentsVisibleTo(volunteer: { id: string; assignedStation: string | null }) {
    const or: Prisma.IncidentWhereInput[] = [{ volunteerId: volunteer.id }];
    if (volunteer.assignedStation) or.push({ location: volunteer.assignedStation });
    return this.prisma.incident.findMany({ where: { OR: or }, orderBy: { createdAt: 'desc' }, take: 30 });
  }

  /** Everything the volunteer dashboard needs in one call. */
  async getMine(userId: string) {
    const volunteer = await this.findMine(userId);
    const [attendance, incidents] = await Promise.all([
      this.prisma.volunteerAttendance.findMany({ where: { volunteerId: volunteer.id }, orderBy: { checkInAt: 'desc' } }),
      this.incidentsVisibleTo(volunteer),
    ]);
    return { volunteer, attendance, incidents, checkInOpen: isVolunteerCheckInOpen() };
  }

  async checkIn(userId: string, geo: GeoDto) {
    const volunteer = await this.findApproved(userId);
    if (!isVolunteerCheckInOpen()) throw new BadRequestException('Shift check-in opens during race week.');
    if (await this.openShift(volunteer.id)) throw new ConflictException('You are already checked in.');

    const now = new Date();
    const [attendance] = await this.prisma.$transaction([
      this.prisma.volunteerAttendance.create({
        data: {
          volunteerId: volunteer.id,
          checkInAt: now,
          station: volunteer.assignedStation,
          latitude: geo.latitude ?? null,
          longitude: geo.longitude ?? null,
        },
      }),
      this.prisma.volunteer.update({ where: { id: volunteer.id }, data: { dutyStatus: 'ON_DUTY', dutyStatusAt: now } }),
    ]);
    this.logger.log(`Volunteer checked in: ${volunteer.fullName} @ ${volunteer.assignedStation ?? 'unassigned'}`);
    return attendance;
  }

  async checkOut(userId: string) {
    const volunteer = await this.findApproved(userId);
    const open = await this.openShift(volunteer.id);
    if (!open) throw new ConflictException('You are not checked in.');

    const now = new Date();
    const [attendance] = await this.prisma.$transaction([
      this.prisma.volunteerAttendance.update({ where: { id: open.id }, data: { checkOutAt: now } }),
      this.prisma.volunteer.update({ where: { id: volunteer.id }, data: { dutyStatus: 'OFF_DUTY', dutyStatusAt: now } }),
    ]);
    return attendance;
  }

  /** On duty / on break while checked in. Going off duty is done by checking out. */
  async setDutyStatus(userId: string, dto: DutyStatusDto) {
    const volunteer = await this.findApproved(userId);
    if (dto.status === 'OFF_DUTY') throw new BadRequestException('Check out to end your shift.');
    if (!(await this.openShift(volunteer.id))) throw new ConflictException('Check in to your shift first.');
    return this.prisma.volunteer.update({
      where: { id: volunteer.id },
      data: { dutyStatus: dto.status, dutyStatusAt: new Date() },
    });
  }

  async updateChecklist(userId: string, dto: ChecklistItemDto) {
    const volunteer = await this.findApproved(userId);
    const current: Record<string, string> = { ...((volunteer.checklist as Record<string, string> | null) ?? {}) };
    if (dto.done) {
      if (!current[dto.itemId] && Object.keys(current).length >= MAX_CHECKLIST_ITEMS) {
        throw new BadRequestException('Checklist is full.');
      }
      current[dto.itemId] = new Date().toISOString();
    } else {
      delete current[dto.itemId];
    }
    const updated = await this.prisma.volunteer.update({ where: { id: volunteer.id }, data: { checklist: current } });
    return { checklist: updated.checklist };
  }

  async createIncident(userId: string, dto: CreateIncidentDto) {
    const volunteer = await this.findApproved(userId);
    const incident = await this.prisma.incident.create({
      data: {
        reporterId: userId,
        volunteerId: volunteer.id,
        type: dto.type,
        severity: dto.isSos ? 'CRITICAL' : dto.severity,
        isSos: Boolean(dto.isSos),
        location: dto.location?.trim() || volunteer.assignedStation || 'Location not given',
        latitude: dto.latitude ?? null,
        longitude: dto.longitude ?? null,
        runnerBib: dto.runnerBib?.trim().toUpperCase() || null,
        description: dto.description.trim(),
      },
    });
    const line =
      `${incident.isSos ? 'SOS' : 'Incident'} ${incident.type}/${incident.severity} at ${incident.location} ` +
      `reported by ${volunteer.fullName} (${volunteer.phone})`;
    if (incident.isSos || incident.severity === 'CRITICAL') this.logger.warn(line);
    else this.logger.log(line);
    return incident;
  }

  async listMyIncidents(userId: string) {
    const volunteer = await this.findMine(userId);
    return this.incidentsVisibleTo(volunteer);
  }

  // ---------- Staff operations ----------

  async approve(volunteerId: string) {
    const volunteer = await this.prisma.volunteer.findUnique({ where: { id: volunteerId } });
    if (!volunteer) throw new NotFoundException('Volunteer not found');
    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.volunteer.update({ where: { id: volunteerId }, data: { status: 'approved' } });
      if (volunteer.userId) await tx.user.update({ where: { id: volunteer.userId }, data: { status: 'ACTIVE' } });
      return updated;
    });
  }

  async assign(volunteerId: string, dto: AssignVolunteerDto) {
    const volunteer = await this.prisma.volunteer.findUnique({ where: { id: volunteerId } });
    if (!volunteer) throw new NotFoundException('Volunteer not found');
    const text = (value: string) => value.trim() || null;
    const data: Prisma.VolunteerUpdateInput = {};
    if (dto.assignedRole !== undefined) data.assignedRole = text(dto.assignedRole);
    if (dto.assignedStation !== undefined) data.assignedStation = text(dto.assignedStation);
    if (dto.assignedSector !== undefined) data.assignedSector = text(dto.assignedSector);
    if (dto.supervisorName !== undefined) data.supervisorName = text(dto.supervisorName);
    if (dto.supervisorPhone !== undefined) data.supervisorPhone = text(dto.supervisorPhone);
    if (dto.shiftStart !== undefined) data.shiftStart = new Date(dto.shiftStart);
    if (dto.shiftEnd !== undefined) data.shiftEnd = new Date(dto.shiftEnd);
    return this.prisma.volunteer.update({ where: { id: volunteerId }, data });
  }

  /** Race-control feed: unresolved SOS first, then newest. */
  async listIncidents(status?: string) {
    if (status && !INCIDENT_STATUSES.includes(status)) throw new BadRequestException('Unknown incident status');
    const incidents = await this.prisma.incident.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: 'desc' },
      take: 200,
      include: { volunteer: { select: { assignedStation: true, user: { select: IDENTITY_SELECT } } } },
    });
    const urgent = (i: { isSos: boolean; status: string }) => (i.isSos && i.status !== 'RESOLVED' ? 1 : 0);
    // Keep the response shape race control expects: volunteer { fullName, phone, assignedStation }.
    return incidents
      .sort((a, b) => urgent(b) - urgent(a))
      .map(({ volunteer, ...incident }) => ({
        ...incident,
        volunteer: volunteer
          ? { fullName: displayName(volunteer.user), phone: volunteer.user.phone, assignedStation: volunteer.assignedStation }
          : null,
      }));
  }

  async updateIncident(id: string, dto: UpdateIncidentDto) {
    const incident = await this.prisma.incident.findUnique({ where: { id } });
    if (!incident) throw new NotFoundException('Incident not found');
    const now = new Date();
    return this.prisma.incident.update({
      where: { id },
      data: {
        status: dto.status,
        acknowledgedAt: dto.status === 'OPEN' ? incident.acknowledgedAt : (incident.acknowledgedAt ?? now),
        resolvedAt: dto.status === 'RESOLVED' ? now : null,
        resolutionNote: dto.resolutionNote?.trim() || incident.resolutionNote,
      },
    });
  }
}
