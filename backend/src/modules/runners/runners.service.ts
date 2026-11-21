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
import { STAFF_ROLES } from '../../common/constants/roles';
import { ageOnRaceDay, isTimedDistance } from '../../common/constants/event';
import { IDENTITY_SELECT, UsersService, displayName, withIdentity } from '../users/users.service';
import { CreateRunnerDto } from './dto/create-runner.dto';
import { AllotBibDto, KitCollectedDto, UpdateMedicalDto, UpdateRunnerProfileDto, UpsertResultDto } from './dto/runner-ops.dto';
import { quotePrice } from './pricing';

/** What runner self-service reads return: the published result and the identity from users. */
const RUNNER_READ_INCLUDE = { result: true, user: { select: IDENTITY_SELECT } } satisfies Prisma.RunnerRegistrationInclude;

@Injectable()
export class RunnersService {
  private readonly logger = new Logger(RunnersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly users: UsersService,
  ) {}

  private generateRegistrationNumber(distance: string): string {
    const cleanDist = distance.replace(/[^0-9]/g, '');
    const prefix = cleanDist ? `${cleanDist}K` : 'OPEN';
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    return `RJG-2027-${prefix}-${randomSuffix}`;
  }

  /** Register the signed-in user as a runner. Price, age and role are all decided here, on the server. */
  async registerRunner(userId: string, dto: CreateRunnerDto) {
    // Identity (name, email, mobile) is the signed-in user's; eligibility, the profile and the role
    // change happen in one transaction (UsersService.createRoleProfile).
    const quote = quotePrice(dto.categoryDistance, dto.selectedAddons ?? [], dto.couponCode);
    if (!quote) throw new BadRequestException('Invalid race category selected.');

    const parsedDob = new Date(dto.dateOfBirth);
    if (isNaN(parsedDob.getTime())) throw new BadRequestException('Invalid date of birth');

    const age = ageOnRaceDay(parsedDob);
    if (age < quote.category.minAge) {
      throw new BadRequestException(
        `Participants for ${quote.category.distance} must be at least ${quote.category.minAge} years old on race day.`,
      );
    }
    if (!dto.waiverAgreed) throw new BadRequestException('You must accept the event waiver to register.');

    // Registration numbers are random; retry on the (rare) clash.
    for (let attempt = 0; attempt < 5; attempt++) {
      const registrationNumber = this.generateRegistrationNumber(quote.category.distance);
      try {
        const { profile: record, user } = await this.users.createRoleProfile(userId, Role.RUNNER, 'ACTIVE', (tx) =>
          tx.runnerRegistration.create({
            data: {
              userId,
              registrationNumber,
              distance: quote.category.distance,
              raceTitle: quote.category.title,
              baseFee: quote.category.fee,
              dateOfBirth: parsedDob,
              ageOnRaceDay: age,
              gender: dto.gender,
              bloodGroup: dto.bloodGroup,
              tshirtSize: dto.tshirtSize,
              bibName: dto.bibName.toUpperCase().trim(),
              emergencyName: dto.emergencyName.trim(),
              emergencyRelation: dto.emergencyRelation,
              emergencyPhone: dto.emergencyPhone.trim(),
              medicalNotes: dto.medicalNotes?.trim() || null,
              city: dto.city.trim(),
              state: dto.state.trim(),
              pincode: dto.pincode.trim(),
              country: dto.country?.trim() || 'India',
              runningClub: dto.runningClub?.trim() || null,
              estimatedFinishTime: isTimedDistance(quote.category.distance) ? dto.estimatedFinishTime || null : null,
              selectedAddons: quote.addons.map((a) => ({ id: a.id, title: a.title, price: a.price })),
              grossAmount: quote.gross,
              discountAmount: quote.discount,
              netAmount: quote.net,
              couponCode: quote.coupon,
              waiverAgreed: true,
              // Payments are not live yet: registrations are confirmed straight away before launch.
              paymentStatus: 'CONFIRMED',
            },
          }),
        );

        this.logger.log(`Runner registered: ${record.registrationNumber} (user ${userId})`);
        return {
          success: true,
          registrationNumber: record.registrationNumber,
          runnerName: displayName(user),
          bibName: record.bibName,
          distance: record.distance,
          raceTitle: record.raceTitle,
          email: user.email,
          paymentStatus: record.paymentStatus,
          qrToken: record.qrCodeToken,
          createdAt: record.createdAt,
        };
      } catch (error) {
        const clash = error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';
        if (!clash) throw error;
        const target = JSON.stringify(error.meta?.target ?? '');
        if (!target.includes('registration_number')) {
          // Unique clash on user_id: a registration was saved in the meantime.
          throw new BadRequestException('You have already submitted this registration.');
        }
      }
    }
    throw new BadRequestException('We could not generate a registration number. Please try again.');
  }

  /**
   * A registration can be read by its owner or by staff. Responses are read models: the registration's
   * own fields plus the runner's identity (firstName, lastName, fullName, email, phone) joined from users.
   */
  async getRegistrationByNumber(registrationNumber: string, requester: { id: string; role: Role | null }) {
    const record = await this.prisma.runnerRegistration.findUnique({
      where: { registrationNumber },
      include: { user: { select: IDENTITY_SELECT } },
    });
    if (!record) throw new NotFoundException('Registration not found');

    const isOwner = record.userId === requester.id;
    const isStaff = requester.role ? STAFF_ROLES.includes(requester.role) : false;
    if (!isOwner && !isStaff) throw new ForbiddenException('You do not have access to this registration.');
    return withIdentity(record);
  }

  /** The signed-in runner's own registration with its result (if published) and identity. */
  async getMine(userId: string) {
    const record = await this.prisma.runnerRegistration.findUnique({ where: { userId }, include: RUNNER_READ_INCLUDE });
    if (!record) throw new NotFoundException('You do not have a runner registration.');
    return withIdentity(record);
  }

  /** Runner updates their emergency contact and medical details (shown to race medical staff). */
  async updateMedical(userId: string, dto: UpdateMedicalDto) {
    const existing = await this.prisma.runnerRegistration.findUnique({ where: { userId } });
    if (!existing) throw new NotFoundException('You do not have a runner registration.');

    const updated = await this.prisma.runnerRegistration.update({
      where: { userId },
      data: {
        emergencyName: dto.emergencyName.trim(),
        emergencyRelation: dto.emergencyRelation.trim(),
        emergencyPhone: dto.emergencyPhone.trim(),
        bloodGroup: dto.bloodGroup,
        medicalNotes: dto.medicalNotes?.trim() || null,
        medicalUpdatedAt: new Date(),
      },
      include: RUNNER_READ_INCLUDE,
    });
    this.logger.log(`Medical profile updated: ${updated.registrationNumber}`);
    return withIdentity(updated);
  }

  /**
   * Runner updates their athlete profile. Name and mobile are identity, so they are written to the
   * users row (the single source of truth); bib name, T-shirt and address stay on the registration.
   * Both writes are one transaction.
   */
  async updateProfile(userId: string, dto: UpdateRunnerProfileDto) {
    const existing = await this.prisma.runnerRegistration.findUnique({ where: { userId } });
    if (!existing) throw new NotFoundException('You do not have a runner registration.');

    const updated = await this.prisma.$transaction(async (tx) => {
      await this.users.updateIdentity(userId, { firstName: dto.firstName, lastName: dto.lastName, phone: dto.phone }, tx);
      return tx.runnerRegistration.update({
        where: { userId },
        data: {
          bibName: dto.bibName.toUpperCase().trim(),
          tshirtSize: dto.tshirtSize,
          city: dto.city.trim(),
          state: dto.state.trim(),
          pincode: dto.pincode.trim(),
          country: dto.country?.trim() || 'India',
          runningClub: dto.runningClub?.trim() || null,
        },
        include: RUNNER_READ_INCLUDE,
      });
    });

    this.logger.log(`Runner profile updated: ${updated.registrationNumber}`);
    return withIdentity(updated);
  }

  // ---------- Staff operations ----------

  private async findByNumberOrThrow(registrationNumber: string) {
    const record = await this.prisma.runnerRegistration.findUnique({ where: { registrationNumber } });
    if (!record) throw new NotFoundException('Registration not found');
    return record;
  }

  async allotBib(registrationNumber: string, dto: AllotBibDto) {
    await this.findByNumberOrThrow(registrationNumber);
    try {
      return await this.prisma.runnerRegistration.update({
        where: { registrationNumber },
        data: { bibNumber: dto.bibNumber.toUpperCase().trim(), startWave: dto.startWave?.trim() || null },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('This bib number is already allotted to another runner.');
      }
      throw error;
    }
  }

  async markKitCollected(registrationNumber: string, dto: KitCollectedDto) {
    const record = await this.findByNumberOrThrow(registrationNumber);
    if (record.kitCollectedAt) throw new ConflictException('Kit was already collected for this registration.');
    return this.prisma.runnerRegistration.update({
      where: { registrationNumber },
      data: { kitCollectedAt: new Date(), kitCollectedBy: dto.collectedBy?.trim() || 'SELF' },
    });
  }

  async upsertResult(registrationNumber: string, dto: UpsertResultDto) {
    const record = await this.findByNumberOrThrow(registrationNumber);
    if (!isTimedDistance(record.distance)) {
      throw new BadRequestException(`${record.distance} is a non-timed category; results are not published.`);
    }
    const splits = [...(dto.splits ?? [])].sort((a, b) => a.distanceKm - b.distanceKm);
    const data = {
      status: dto.status,
      gunTimeSeconds: dto.gunTimeSeconds ?? null,
      netTimeSeconds: dto.netTimeSeconds ?? null,
      overallRank: dto.overallRank ?? null,
      genderRank: dto.genderRank ?? null,
      categoryRank: dto.categoryRank ?? null,
      ageCategory: dto.ageCategory ?? null,
      splits: splits.map((s) => ({ label: s.label, distanceKm: s.distanceKm, elapsedSeconds: s.elapsedSeconds })),
      publishedAt: new Date(),
    };
    return this.prisma.raceResult.upsert({
      where: { registrationId: record.id },
      create: { registrationId: record.id, ...data },
      update: data,
    });
  }

  async listRunners(limit = 50, offset = 0) {
    const [total, rows] = await Promise.all([
      this.prisma.runnerRegistration.count(),
      this.prisma.runnerRegistration.findMany({
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: IDENTITY_SELECT } },
      }),
    ]);
    const runners = rows.map(withIdentity);
    return { total, count: runners.length, runners };
  }
}
