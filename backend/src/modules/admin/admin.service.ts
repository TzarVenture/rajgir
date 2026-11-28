import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { IDENTITY_SELECT, displayName, identityOf } from '../users/users.service';
import type {
  AppealType,
  ApplicationType,
  CreateMediaDto,
  CreateNotificationDto,
  CreatePaymentDto,
  CreateSupportTicketDto,
  Decision,
  UpdateAdminPermissionsDto,
  UpdateSupportTicketDto,
  UpsertCmsBlockDto,
  UpsertEventCategoryDto,
  UpsertSettingDto,
} from './dto/admin.dto';

/** The staff member performing an admin action (for audit entries and self-protection checks). */
export interface AdminActor {
  id: string;
  email: string;
  role: string;
}

/** Runs a write and turns Prisma "record not found" (P2025) into a 404 instead of a 500. */
async function orNotFound<T>(what: string, op: Promise<T>): Promise<T> {
  try {
    return await op;
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') throw new NotFoundException(`${what} not found`);
    throw err;
  }
}

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getPlatformOverview() {
    const [
      runnersCount,
      kitsCollectedCount,
      volunteersCount,
      influencersCount,
      teamsCount,
      corporatesCount,
      schoolsCount,
      openIncidentsCount,
      pendingCorporates,
      pendingSchools,
      pendingSponsors,
      pendingVendors,
      pendingTourism,
      pendingVolunteers,
      pendingInfluencers,
      pendingTeamAppeals,
      pendingCorpAppeals,
      pendingSchoolAppeals,
      revenueResult,
      runnersByCategory,
      tshirtCounts,
    ] = await Promise.all([
      this.prisma.runnerRegistration.count(),
      this.prisma.runnerRegistration.count({ where: { kitCollectedAt: { not: null } } }),
      this.prisma.volunteer.count(),
      this.prisma.influencer.count(),
      this.prisma.teamProfile.count(),
      this.prisma.corporateProfile.count(),
      this.prisma.schoolProfile.count(),
      this.prisma.incident.count({ where: { status: { not: 'RESOLVED' } } }),
      this.prisma.corporateProfile.count({ where: { status: 'pending' } }),
      this.prisma.schoolProfile.count({ where: { status: 'pending' } }),
      this.prisma.sponsorProfile.count({ where: { status: 'pending' } }),
      this.prisma.vendorProfile.count({ where: { status: 'pending' } }),
      this.prisma.tourismProfile.count({ where: { status: 'pending' } }),
      this.prisma.volunteer.count({ where: { status: 'pending' } }),
      this.prisma.influencer.count({ where: { status: 'pending' } }),
      this.prisma.teamProfile.count({ where: { appealStatus: 'PENDING' } }),
      this.prisma.corporateProfile.count({ where: { appealStatus: 'PENDING' } }),
      this.prisma.schoolProfile.count({ where: { appealStatus: 'PENDING' } }),
      this.prisma.runnerRegistration.aggregate({ _sum: { netAmount: true } }),
      this.prisma.runnerRegistration.groupBy({ by: ['distance'], _count: { id: true } }),
      this.prisma.runnerRegistration.groupBy({ by: ['tshirtSize'], _count: { id: true } }),
    ]);

    return {
      totalRunners: runnersCount,
      kitsCollectedCount,
      totalVolunteers: volunteersCount,
      totalInfluencers: influencersCount,
      totalGroups: teamsCount + corporatesCount + schoolsCount,
      openIncidentsCount,
      pendingApprovalsCount:
        pendingCorporates +
        pendingSchools +
        pendingSponsors +
        pendingVendors +
        pendingTourism +
        pendingVolunteers +
        pendingInfluencers,
      pendingQuotaAppealsCount: pendingTeamAppeals + pendingCorpAppeals + pendingSchoolAppeals,
      totalRevenue: revenueResult._sum.netAmount || 0,
      categoryBreakdown: runnersByCategory.map((c) => ({
        distance: c.distance,
        count: c._count.id,
      })),
      tshirtBreakdown: tshirtCounts.map((t) => ({
        size: t.tshirtSize,
        count: t._count.id,
      })),
    };
  }

  async listUsers(limit = 100) {
    return this.prisma.user.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        registrationSource: true,
        createdAt: true,
      },
    });
  }

  async setUserStatus(userId: string, status: 'ACTIVE' | 'SUSPENDED', actor: AdminActor) {
    if (userId === actor.id) throw new ForbiddenException('You cannot change the status of your own account.');
    const existing = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!existing) throw new NotFoundException('User not found');
    if (existing.role === 'SUPER_ADMIN') {
      throw new BadRequestException('Cannot suspend a Super Admin account.');
    }
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { status },
      select: { id: true, status: true },
    });
    const verb = status === 'SUSPENDED' ? 'Suspended' : 'Reactivated';
    await this.recordAuditLog(actor, status === 'SUSPENDED' ? 'SUSPEND_USER' : 'REACTIVATE_USER', 'USER', `${verb} ${displayName(existing)} (${existing.email})`, userId);
    return updated;
  }

  async reviewInfluencer(id: string, decision: Decision, actor: AdminActor) {
    const existing = await this.prisma.influencer.findUnique({ where: { id }, include: { user: { select: IDENTITY_SELECT } } });
    if (!existing) throw new NotFoundException('Influencer not found');
    const status = decision === 'approve' ? 'approved' : 'rejected';
    const userStatus = decision === 'approve' ? ('ACTIVE' as const) : ('SUSPENDED' as const);

    const updated = await this.prisma.$transaction(async (tx) => {
      const rec = await tx.influencer.update({ where: { id }, data: { status } });
      await tx.user.update({ where: { id: existing.userId }, data: { status: userStatus } });
      return rec;
    });
    await this.recordAuditLog(actor, decision === 'approve' ? 'APPROVE_INFLUENCER' : 'REJECT_INFLUENCER', 'INFLUENCER', `Influencer ${displayName(existing.user)} ${status}`, id);
    return updated;
  }

  /** List all quota appeals (50+ runner requests) from Teams, Corporates, and Schools. */
  async listQuotaAppeals() {
    const [teams, corporates, schools] = await Promise.all([
      this.prisma.teamProfile.findMany({
        where: { appealStatus: { not: 'NONE' } },
        orderBy: { appealSubmittedAt: 'desc' },
        include: { user: { select: IDENTITY_SELECT } },
      }),
      this.prisma.corporateProfile.findMany({
        where: { appealStatus: { not: 'NONE' } },
        orderBy: { appealSubmittedAt: 'desc' },
        include: { user: { select: IDENTITY_SELECT } },
      }),
      this.prisma.schoolProfile.findMany({
        where: { appealStatus: { not: 'NONE' } },
        orderBy: { appealSubmittedAt: 'desc' },
        include: { user: { select: IDENTITY_SELECT } },
      }),
    ]);

    return [
      ...teams.map((t) => ({
        type: 'team' as const,
        id: t.id,
        organizationName: t.teamName,
        contact: identityOf(t.user),
        currentQuota: t.maxRunnerQuota,
        requestedQuota: t.appealRequestedQuota,
        reason: t.appealReason,
        status: t.appealStatus,
        submittedAt: t.appealSubmittedAt,
      })),
      ...corporates.map((c) => ({
        type: 'corporate' as const,
        id: c.id,
        organizationName: c.companyName,
        contact: identityOf(c.user),
        currentQuota: c.maxRunnerQuota,
        requestedQuota: c.appealRequestedQuota,
        reason: c.appealReason,
        status: c.appealStatus,
        submittedAt: c.appealSubmittedAt,
      })),
      ...schools.map((s) => ({
        type: 'school' as const,
        id: s.id,
        organizationName: s.schoolName,
        contact: identityOf(s.user),
        currentQuota: s.maxRunnerQuota,
        requestedQuota: s.appealRequestedQuota,
        reason: s.appealReason,
        status: s.appealStatus,
        submittedAt: s.appealSubmittedAt,
      })),
    ];
  }

  /** Approve or reject a 50+ runner quota appeal. */
  async reviewQuotaAppeal(type: AppealType, id: string, decision: Decision, approvedQuota: number | undefined, actor: AdminActor) {
    const result = await this.applyQuotaAppealDecision(type, id, decision, approvedQuota);
    const outcome = decision === 'approve' ? `approved (limit ${'maxRunnerQuota' in result ? result.maxRunnerQuota : '-'})` : 'rejected';
    await this.recordAuditLog(actor, decision === 'approve' ? 'APPROVE_QUOTA_APPEAL' : 'REJECT_QUOTA_APPEAL', type.toUpperCase(), `Quota appeal ${outcome}`, id);
    return result;
  }

  private async applyQuotaAppealDecision(type: AppealType, id: string, decision: Decision, approvedQuota?: number) {
    if (!['team', 'corporate', 'school'].includes(type)) {
      throw new BadRequestException('Invalid group type');
    }

    const updateQuota = async (currentRequested: number | null) => {
      if (decision === 'approve') {
        const nextQuota = approvedQuota ?? currentRequested;
        if (!nextQuota || nextQuota < 51) {
          throw new BadRequestException('Approved quota must be greater than 50.');
        }
        return { appealStatus: 'APPROVED' as const, maxRunnerQuota: nextQuota };
      }
      return { appealStatus: 'REJECTED' as const };
    };

    if (type === 'team') {
      const existing = await this.prisma.teamProfile.findUnique({ where: { id } });
      if (!existing) throw new NotFoundException('Team profile not found');
      const data = await updateQuota(existing.appealRequestedQuota);
      return this.prisma.teamProfile.update({ where: { id }, data });
    }
    if (type === 'corporate') {
      const existing = await this.prisma.corporateProfile.findUnique({ where: { id } });
      if (!existing) throw new NotFoundException('Corporate profile not found');
      const data = await updateQuota(existing.appealRequestedQuota);
      return this.prisma.corporateProfile.update({ where: { id }, data });
    }

    const existing = await this.prisma.schoolProfile.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('School profile not found');
    const data = await updateQuota(existing.appealRequestedQuota);
    return this.prisma.schoolProfile.update({ where: { id }, data });
  }

  /** List pending/reviewed Group & Partner applications for admin review. */
  async listApplications() {
    const [corporates, schools, sponsors, vendors, tourism] = await Promise.all([
      this.prisma.corporateProfile.findMany({ orderBy: { submittedAt: 'desc' }, include: { user: { select: IDENTITY_SELECT } } }),
      this.prisma.schoolProfile.findMany({ orderBy: { submittedAt: 'desc' }, include: { user: { select: IDENTITY_SELECT } } }),
      this.prisma.sponsorProfile.findMany({ orderBy: { submittedAt: 'desc' }, include: { user: { select: IDENTITY_SELECT } } }),
      this.prisma.vendorProfile.findMany({ orderBy: { submittedAt: 'desc' }, include: { user: { select: IDENTITY_SELECT } } }),
      this.prisma.tourismProfile.findMany({ orderBy: { submittedAt: 'desc' }, include: { user: { select: IDENTITY_SELECT } } }),
    ]);

    return {
      corporates: corporates.map((c) => ({ ...c, contact: identityOf(c.user) })),
      schools: schools.map((s) => ({ ...s, contact: identityOf(s.user) })),
      sponsors: sponsors.map((s) => ({ ...s, contact: identityOf(s.user) })),
      vendors: vendors.map((v) => ({ ...v, contact: identityOf(v.user) })),
      tourism: tourism.map((t) => ({ ...t, contact: identityOf(t.user) })),
    };
  }

  /** Approve or reject a Corporate, School, Sponsor, Vendor, or Tourism application. */
  async reviewApplication(type: ApplicationType, id: string, decision: Decision, actor: AdminActor) {
    const profileStatus = decision === 'approve' ? 'approved' : 'rejected';
    const userStatus = decision === 'approve' ? ('ACTIVE' as const) : ('SUSPENDED' as const);

    const result = await orNotFound('Application', this.prisma.$transaction(async (tx) => {
      let userId: string;
      if (type === 'corporate') {
        const rec = await tx.corporateProfile.update({ where: { id }, data: { status: profileStatus } });
        userId = rec.userId;
      } else if (type === 'school') {
        const rec = await tx.schoolProfile.update({ where: { id }, data: { status: profileStatus } });
        userId = rec.userId;
      } else if (type === 'sponsor') {
        const rec = await tx.sponsorProfile.update({ where: { id }, data: { status: profileStatus } });
        userId = rec.userId;
      } else if (type === 'vendor') {
        const rec = await tx.vendorProfile.update({ where: { id }, data: { status: profileStatus } });
        userId = rec.userId;
      } else if (type === 'tourism') {
        const rec = await tx.tourismProfile.update({ where: { id }, data: { status: profileStatus } });
        userId = rec.userId;
      } else {
        throw new BadRequestException('Unsupported application type');
      }

      await tx.user.update({ where: { id: userId }, data: { status: userStatus } });
      return { success: true, type, id, status: profileStatus };
    }));
    await this.recordAuditLog(actor, decision === 'approve' ? 'APPROVE_APPLICATION' : 'REJECT_APPLICATION', type.toUpperCase(), `${type} application ${profileStatus}`, id);
    return result;
  }

  // -------------------------------------------------------------------------
  // Audit Helper
  // -------------------------------------------------------------------------

  async recordAuditLog(actor: AdminActor, action: string, targetType: string, summary: string, targetId?: string) {
    return this.prisma.auditLog.create({
      data: { actorEmail: actor.email, actorRole: actor.role, action, targetType, targetId: targetId ?? null, summary: summary.slice(0, 500) },
    });
  }

  async listAuditLogs(limit = 100) {
    return this.prisma.auditLog.findMany({ take: limit, orderBy: { createdAt: 'desc' } });
  }

  // -------------------------------------------------------------------------
  // Event Categories (/admin/events)
  // -------------------------------------------------------------------------

  async listEventCategories() {
    const count = await this.prisma.eventCategoryConfig.count();
    if (count === 0) {
      await this.prisma.eventCategoryConfig.createMany({
        data: [
          { distance: '42.2 KM', title: 'Full Marathon', fee: 1800, minAge: 18, startTime: '05:00', cutoffMinutes: 360, capacity: 1000, isTimed: true },
          { distance: '21.1 KM', title: 'Half Marathon', fee: 1400, minAge: 18, startTime: '05:30', cutoffMinutes: 210, capacity: 2500, isTimed: true },
          { distance: '10 KM', title: '10K Timed Run', fee: 900, minAge: 14, startTime: '06:00', cutoffMinutes: 120, capacity: 3000, isTimed: true },
          { distance: '5 KM', title: '5K Dream Run', fee: 600, minAge: 10, startTime: '06:30', cutoffMinutes: 90, capacity: 3000, isTimed: false },
          { distance: '3 KM', title: '3K Heritage Fun Run', fee: 400, minAge: 6, startTime: '07:00', cutoffMinutes: 60, capacity: 2000, isTimed: false },
        ],
      });
    }
    return this.prisma.eventCategoryConfig.findMany({ orderBy: { fee: 'desc' } });
  }

  async upsertEventCategory(dto: UpsertEventCategoryDto, actor: AdminActor) {
    // Explicit fields only (the body used to be spread straight into the create).
    const fields = {
      title: dto.title.trim(),
      fee: dto.fee,
      minAge: dto.minAge,
      startTime: dto.startTime,
      cutoffMinutes: dto.cutoffMinutes,
      capacity: dto.capacity,
      isTimed: dto.isTimed,
      isActive: dto.isActive,
    };
    const distance = dto.distance.trim();
    const rec = await this.prisma.eventCategoryConfig.upsert({
      where: { distance },
      create: { distance, ...fields },
      update: fields,
    });
    await this.recordAuditLog(actor, 'UPSERT_EVENT_CATEGORY', 'EVENT', `Saved ${rec.distance} (₹${rec.fee}, cap ${rec.capacity}, ${rec.isActive ? 'open' : 'paused'})`, rec.id);
    return rec;
  }

  // -------------------------------------------------------------------------
  // Payments & Ledger (/admin/payments)
  // -------------------------------------------------------------------------

  async listPayments(limit = 100) {
    return this.prisma.paymentTransaction.findMany({ take: limit, orderBy: { createdAt: 'desc' } });
  }

  async createPayment(dto: CreatePaymentDto, actor: AdminActor) {
    const rec = await this.prisma.paymentTransaction.create({
      data: {
        registrationNumber: dto.registrationNumber?.trim() || null,
        payerName: dto.payerName.trim(),
        payerEmail: dto.payerEmail.trim().toLowerCase(),
        distance: dto.distance?.trim() || null,
        amount: dto.amount,
        gstAmount: dto.gstAmount ?? 0,
        method: dto.method?.trim() || 'MANUAL',
        referenceCode: dto.referenceCode?.trim() || null,
        status: dto.status ?? 'CAPTURED',
        notes: dto.notes?.trim() || null,
      },
    });
    await this.recordAuditLog(actor, 'CREATE_PAYMENT', 'PAYMENT', `Recorded ₹${rec.amount} (${rec.status}) for ${rec.payerName}`, rec.id);
    return rec;
  }

  async updatePaymentStatus(id: string, status: 'CAPTURED' | 'PENDING' | 'REFUNDED', actor: AdminActor) {
    const rec = await orNotFound('Payment', this.prisma.paymentTransaction.update({ where: { id }, data: { status } }));
    await this.recordAuditLog(actor, 'UPDATE_PAYMENT_STATUS', 'PAYMENT', `₹${rec.amount} from ${rec.payerName} marked ${status}`, id);
    return rec;
  }

  // -------------------------------------------------------------------------
  // Media Assets (/admin/media)
  // -------------------------------------------------------------------------

  async listMediaAssets() {
    return this.prisma.mediaAsset.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async createMediaAsset(dto: CreateMediaDto, actor: AdminActor) {
    const rec = await this.prisma.mediaAsset.create({
      data: {
        title: dto.title.trim(),
        category: dto.category.trim() || 'PHOTO',
        url: dto.url.trim(),
        caption: dto.caption?.trim() || null,
        isPublished: dto.isPublished ?? true,
      },
    });
    await this.recordAuditLog(actor, 'CREATE_MEDIA', 'MEDIA', `Added media "${rec.title}"`, rec.id);
    return rec;
  }

  async toggleMediaAsset(id: string, isPublished: boolean, actor: AdminActor) {
    const rec = await orNotFound('Media asset', this.prisma.mediaAsset.update({ where: { id }, data: { isPublished } }));
    await this.recordAuditLog(actor, 'TOGGLE_MEDIA', 'MEDIA', `Media "${rec.title}" ${isPublished ? 'published' : 'hidden'}`, id);
    return rec;
  }

  // -------------------------------------------------------------------------
  // CMS Content Blocks (/admin/cms)
  // -------------------------------------------------------------------------

  async listCmsBlocks() {
    const count = await this.prisma.cmsBlock.count();
    if (count === 0) {
      await this.prisma.cmsBlock.createMany({
        data: [
          { slug: 'hero-announcement', title: 'Homepage Hero Announcement', section: 'HOMEPAGE', content: 'Registrations open for Rajgir Heritage Marathon 2027 — Run through ancient Nalanda & Rajgir hills.', isPublished: true },
          { slug: 'expo-pickup-banner', title: 'Expo Kit Pickup Notice', section: 'EXPO', content: 'Collect your Bib and Race Kit at Rajgir Convention Centre. Strictly no race-morning kit distribution.', isPublished: true },
          { slug: 'race-day-advisory', title: 'Race Day Weather & Hydration Advisory', section: 'RACE_DAY', content: 'Hydration & medical booths are stationed every 2.5 km along the course.', isPublished: true },
        ],
      });
    }
    return this.prisma.cmsBlock.findMany({ orderBy: { updatedAt: 'desc' } });
  }

  async upsertCmsBlock(dto: UpsertCmsBlockDto, actor: AdminActor) {
    const fields = {
      title: dto.title.trim(),
      section: dto.section.trim() || 'HOMEPAGE',
      content: dto.content.trim(),
      isPublished: dto.isPublished,
      updatedByEmail: actor.email,
    };
    const rec = await this.prisma.cmsBlock.upsert({
      where: { slug: dto.slug },
      create: { slug: dto.slug, ...fields },
      update: fields,
    });
    await this.recordAuditLog(actor, 'UPSERT_CMS', 'CMS', `Saved CMS block "${rec.slug}"`, rec.id);
    return rec;
  }

  // -------------------------------------------------------------------------
  // Notification Campaigns (/admin/notifications)
  // -------------------------------------------------------------------------

  async listNotificationCampaigns() {
    return this.prisma.notificationCampaign.findMany({ orderBy: { createdAt: 'desc' } });
  }

  /** Records a campaign and its audience size. No delivery service is connected: nothing is sent. */
  async createNotificationCampaign(dto: CreateNotificationDto, actor: AdminActor) {
    let recipientCount = 0;
    if (dto.audience === 'ALL_RUNNERS') {
      recipientCount = await this.prisma.runnerRegistration.count();
    } else if (dto.audience === 'VOLUNTEERS') {
      recipientCount = await this.prisma.volunteer.count();
    } else {
      recipientCount = await this.prisma.user.count();
    }
    const status = dto.sendNow ? 'QUEUED' : 'DRAFT';
    const rec = await this.prisma.notificationCampaign.create({
      data: {
        title: dto.title.trim(),
        channel: dto.channel,
        audience: dto.audience,
        message: dto.message.trim(),
        recipientCount,
        status,
        createdByEmail: actor.email,
        sentAt: null,
      },
    });
    await this.recordAuditLog(actor, 'CREATE_CAMPAIGN', 'NOTIFICATION', `Created "${rec.title}" (${rec.channel}, ${rec.status}, ${recipientCount} recipients)`, rec.id);
    return rec;
  }

  // -------------------------------------------------------------------------
  // Support Tickets (/admin/support)
  // -------------------------------------------------------------------------

  async listSupportTickets() {
    return this.prisma.supportTicket.findMany({ orderBy: { createdAt: 'desc' } });
  }

  /** Next ticket number, TKT-000001 upwards (the old Date.now()-based number could repeat). */
  private async nextTicketNumber(): Promise<string> {
    const last = await this.prisma.supportTicket.findFirst({
      where: { ticketNumber: { startsWith: 'TKT-' } },
      orderBy: { createdAt: 'desc' },
      select: { ticketNumber: true },
    });
    const n = Number(last?.ticketNumber.replace(/\D/g, '') ?? 0);
    return `TKT-${String((Number.isFinite(n) ? n : 0) + 1).padStart(6, '0')}`;
  }

  async createSupportTicket(dto: CreateSupportTicketDto, actor: AdminActor) {
    for (let attempt = 0; attempt < 3; attempt++) {
      const ticketNumber = await this.nextTicketNumber();
      try {
        const rec = await this.prisma.supportTicket.create({
          data: {
            ticketNumber,
            requesterName: dto.requesterName.trim(),
            requesterEmail: dto.requesterEmail.trim().toLowerCase(),
            category: dto.category.trim() || 'GENERAL',
            subject: dto.subject.trim(),
            message: dto.message.trim(),
            priority: dto.priority ?? 'NORMAL',
            status: 'OPEN',
          },
        });
        await this.recordAuditLog(actor, 'CREATE_TICKET', 'SUPPORT', `Opened ${ticketNumber}: ${rec.subject}`, rec.id);
        return rec;
      } catch (err) {
        // Two tickets created at the same moment: take the next number.
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') continue;
        throw err;
      }
    }
    throw new BadRequestException('Could not create the ticket. Please try again.');
  }

  /** Changes only the fields that were sent; an empty assignedTo clears the assignee. */
  async updateSupportTicket(id: string, dto: UpdateSupportTicketDto, actor: AdminActor) {
    const data: Prisma.SupportTicketUpdateInput = {};
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.assignedTo !== undefined) data.assignedTo = dto.assignedTo.trim() || null;
    if (dto.resolutionNote !== undefined) data.resolutionNote = dto.resolutionNote.trim() || null;
    if (Object.keys(data).length === 0) throw new BadRequestException('Nothing to update.');

    const rec = await orNotFound('Support ticket', this.prisma.supportTicket.update({ where: { id }, data }));
    await this.recordAuditLog(actor, 'UPDATE_TICKET', 'SUPPORT', `Ticket ${rec.ticketNumber} -> ${rec.status}`, id);
    return rec;
  }

  // -------------------------------------------------------------------------
  // Admin Permissions & Roles (/admin/permissions, /admin/roles)
  // -------------------------------------------------------------------------

  async listAdminProfiles() {
    return this.prisma.adminProfile.findMany({
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true, role: true, status: true } } },
    });
  }

  async updateAdminPermissions(id: string, dto: UpdateAdminPermissionsDto, actor: AdminActor) {
    const flags = [
      'isActive',
      'canManageRunners',
      'canAllotBibs',
      'canManageVolunteers',
      'canManageInfluencers',
      'canManageGroups',
      'canManagePartners',
      'canManageIncidents',
    ] as const;
    const data: Prisma.AdminProfileUpdateInput = {};
    if (dto.designation !== undefined) data.designation = dto.designation.trim();
    for (const flag of flags) if (dto[flag] !== undefined) data[flag] = dto[flag];
    if (Object.keys(data).length === 0) throw new BadRequestException('Nothing to update.');

    const rec = await orNotFound(
      'Admin profile',
      this.prisma.adminProfile.update({
        where: { id },
        data,
        include: { user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true, role: true, status: true } } },
      }),
    );
    const changed = Object.entries(data)
      .map(([k, v]) => `${k}=${String(v)}`)
      .join(', ');
    await this.recordAuditLog(actor, 'UPDATE_ADMIN_PERMISSIONS', 'ADMIN', `Permissions for ${rec.user.email}: ${changed}`, id);
    return rec;
  }

  // -------------------------------------------------------------------------
  // Platform Settings (/admin/settings)
  // -------------------------------------------------------------------------

  async listSettings() {
    const count = await this.prisma.platformSetting.count();
    if (count === 0) {
      await this.prisma.platformSetting.createMany({
        data: [
          { key: 'event_name', value: 'Rajgir Heritage Marathon 2027', category: 'EVENT', description: 'Official event display name' },
          { key: 'race_date', value: '2027-02-14', category: 'EVENT', description: 'Race day ISO date' },
          { key: 'registration_open', value: 'true', category: 'FEATURES', description: 'Allow new runner registrations' },
          { key: 'group_max_quota', value: '50', category: 'QUOTA', description: 'Default runner cap before 50+ appeal' },
          { key: 'support_email', value: 'help@rajgirmarathon.com', category: 'CONTACT', description: 'Official runner helpdesk email' },
        ],
      });
    }
    return this.prisma.platformSetting.findMany({ orderBy: { category: 'asc' } });
  }

  async upsertSetting(dto: UpsertSettingDto, actor: AdminActor) {
    const rec = await this.prisma.platformSetting.upsert({
      where: { key: dto.key },
      create: {
        key: dto.key,
        value: dto.value.trim(),
        category: dto.category?.trim() || 'GENERAL',
        description: dto.description?.trim() || null,
      },
      update: {
        value: dto.value.trim(),
        ...(dto.category ? { category: dto.category.trim() } : {}),
        ...(dto.description !== undefined ? { description: dto.description.trim() || null } : {}),
      },
    });
    await this.recordAuditLog(actor, 'UPDATE_SETTING', 'SETTING', `Set ${rec.key} = ${rec.value}`, rec.key);
    return rec;
  }
}
