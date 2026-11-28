import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { IDENTITY_SELECT, identityOf } from '../users/users.service';

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

  async setUserStatus(userId: string, status: 'ACTIVE' | 'SUSPENDED') {
    if (!['ACTIVE', 'SUSPENDED'].includes(status)) {
      throw new BadRequestException('Status must be ACTIVE or SUSPENDED');
    }
    const existing = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!existing) throw new NotFoundException('User not found');
    if (existing.role === 'SUPER_ADMIN') {
      throw new BadRequestException('Cannot suspend a Super Admin account.');
    }
    return this.prisma.user.update({
      where: { id: userId },
      data: { status },
      select: { id: true, status: true },
    });
  }

  async reviewInfluencer(id: string, decision: 'approve' | 'reject') {
    const existing = await this.prisma.influencer.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Influencer not found');
    const status = decision === 'approve' ? 'approved' : 'rejected';
    const userStatus = decision === 'approve' ? ('ACTIVE' as const) : ('SUSPENDED' as const);

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.influencer.update({ where: { id }, data: { status } });
      await tx.user.update({ where: { id: existing.userId }, data: { status: userStatus } });
      return updated;
    });
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
  async reviewQuotaAppeal(
    type: 'team' | 'corporate' | 'school',
    id: string,
    decision: 'approve' | 'reject',
    approvedQuota?: number,
  ) {
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
  async reviewApplication(
    type: 'corporate' | 'school' | 'sponsor' | 'vendor' | 'tourism',
    id: string,
    decision: 'approve' | 'reject',
  ) {
    const profileStatus = decision === 'approve' ? 'approved' : 'rejected';
    const userStatus = decision === 'approve' ? ('ACTIVE' as const) : ('SUSPENDED' as const);

    return this.prisma.$transaction(async (tx) => {
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
    });
  }
}
