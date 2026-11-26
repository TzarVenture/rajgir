import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, RegistrationSource, Role } from '@prisma/client';
import { ageOnRaceDay } from '../../common/constants/event';
import { PrismaService } from '../../prisma/prisma.service';
import { quotePrice } from '../runners/pricing';
import {
  IDENTITY_SELECT,
  cleanNamePart,
  identityOf,
  normalizeEmail,
  normalizeMobile,
} from '../users/users.service';
import {
  AddManagedRunnerDto,
  SubmitQuotaAppealDto,
  UpdateGroupProfileDto,
  UpdatePartnerProfileDto,
} from './dto/group-ops.dto';

const GROUP_ROLES: Role[] = [Role.TEAM_CAPTAIN, Role.CORPORATE_MANAGER, Role.SCHOOL_COORDINATOR];
const PARTNER_ROLES: Role[] = [Role.SPONSOR, Role.VENDOR, Role.TOURISM_PARTNER];

const SOURCE_BY_ROLE: Record<string, RegistrationSource> = {
  TEAM_CAPTAIN: RegistrationSource.TEAM_REGISTERED,
  CORPORATE_MANAGER: RegistrationSource.CORPORATE_REGISTERED,
  SCHOOL_COORDINATOR: RegistrationSource.SCHOOL_REGISTERED,
};

@Injectable()
export class GroupOpsService {
  private readonly logger = new Logger(GroupOpsService.name);

  constructor(private readonly prisma: PrismaService) {}

  private generateRegNumber(distance: string): string {
    const cleanDist = distance.replace(/[^0-9]/g, '');
    const prefix = cleanDist ? `${cleanDist}K` : 'OPEN';
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `RJG-2027-${prefix}-${rand}`;
  }

  private async resolveGroupContext(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        teamProfile: true,
        corporateProfile: true,
        schoolProfile: true,
      },
    });
    if (!user || !user.role || !GROUP_ROLES.includes(user.role)) {
      throw new ForbiddenException('Only Team Captains, Corporate Managers, and School Coordinators can access group operations.');
    }

    if (user.role === Role.TEAM_CAPTAIN && user.teamProfile) {
      return {
        user,
        role: user.role,
        source: SOURCE_BY_ROLE[user.role],
        orgName: user.teamProfile.teamName,
        city: user.teamProfile.city,
        profile: user.teamProfile,
        modelKey: 'teamProfile' as const,
      };
    }
    if (user.role === Role.CORPORATE_MANAGER && user.corporateProfile) {
      return {
        user,
        role: user.role,
        source: SOURCE_BY_ROLE[user.role],
        orgName: user.corporateProfile.companyName,
        city: 'Rajgir',
        profile: user.corporateProfile,
        modelKey: 'corporateProfile' as const,
      };
    }
    if (user.role === Role.SCHOOL_COORDINATOR && user.schoolProfile) {
      return {
        user,
        role: user.role,
        source: SOURCE_BY_ROLE[user.role],
        orgName: user.schoolProfile.schoolName,
        city: user.schoolProfile.city,
        profile: user.schoolProfile,
        modelKey: 'schoolProfile' as const,
      };
    }

    throw new NotFoundException('Group profile not found.');
  }

  /** Fetch group profile, 50-runner quota usage, appeal state, and all managed runners. */
  async getGroupDashboard(userId: string) {
    const ctx = await this.resolveGroupContext(userId);
    const managedUsers = await this.prisma.user.findMany({
      where: { registeredByUserId: userId, role: Role.RUNNER },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        registrationSource: true,
        createdAt: true,
        runnerRegistration: {
          select: {
            id: true,
            registrationNumber: true,
            distance: true,
            raceTitle: true,
            dateOfBirth: true,
            ageOnRaceDay: true,
            gender: true,
            bibName: true,
            bibNumber: true,
            bloodGroup: true,
            tshirtSize: true,
            emergencyName: true,
            emergencyRelation: true,
            emergencyPhone: true,
            paymentStatus: true,
            qrCodeToken: true,
            createdAt: true,
          },
        },
      },
    });

    const runners = managedUsers
      .filter((u) => u.runnerRegistration)
      .map((u) => ({
        userId: u.id,
        ...identityOf(u),
        registrationSource: u.registrationSource,
        ...u.runnerRegistration!,
      }));

    const used = runners.length;
    const maxRunnerQuota = ctx.profile.maxRunnerQuota;

    return {
      role: ctx.role,
      identity: identityOf(ctx.user),
      profile: ctx.profile,
      quota: {
        used,
        maxRunnerQuota,
        remaining: Math.max(0, maxRunnerQuota - used),
        appealStatus: ctx.profile.appealStatus,
        appealRequestedQuota: ctx.profile.appealRequestedQuota,
        appealReason: ctx.profile.appealReason,
      },
      runners,
    };
  }

  /** Add 1 or more managed runners (skips Supabase Auth, enforces 50-runner quota). */
  async addManagedRunners(userId: string, inputs: AddManagedRunnerDto[]) {
    const ctx = await this.resolveGroupContext(userId);

    if (ctx.user.status !== 'ACTIVE' && ctx.role !== Role.TEAM_CAPTAIN) {
      throw new ForbiddenException('Your organization must be approved before adding runners.');
    }

    const currentCount = await this.prisma.user.count({
      where: { registeredByUserId: userId, role: Role.RUNNER },
    });

    const maxQuota = ctx.profile.maxRunnerQuota;
    if (currentCount + inputs.length > maxQuota) {
      throw new ForbiddenException({
        code: 'QUOTA_EXCEEDED',
        message: `Quota limit reached (${currentCount}/${maxQuota} runners). Submit an appeal to Admin to add more than ${maxQuota} runners.`,
        used: currentCount,
        maxRunnerQuota: maxQuota,
      });
    }

    const seenEmails = new Set<string>();
    const seenPhones = new Set<string>();
    const prepared = inputs.map((dto, index) => {
      const rowNum = index + 1;
      const firstName = cleanNamePart(dto.firstName);
      const lastName = cleanNamePart(dto.lastName);
      if (!firstName || !lastName) {
        throw new BadRequestException(`Row ${rowNum}: First name and last name are required.`);
      }

      const quote = quotePrice(dto.categoryDistance, [], undefined);
      if (!quote) {
        throw new BadRequestException(`Row ${rowNum}: Invalid race category "${dto.categoryDistance}". Use 42.2 KM, 21.1 KM, 10 KM, 5 KM, or 3 KM.`);
      }

      const dob = new Date(dto.dateOfBirth);
      if (isNaN(dob.getTime())) {
        throw new BadRequestException(`Row ${rowNum} (${firstName} ${lastName}): Invalid date of birth "${dto.dateOfBirth}". Use YYYY-MM-DD.`);
      }

      const age = ageOnRaceDay(dob);
      if (age < quote.category.minAge) {
        throw new BadRequestException(
          `Row ${rowNum} (${firstName} ${lastName}): Must be at least ${quote.category.minAge} years old on race day for ${quote.category.distance}.`,
        );
      }

      const email = dto.email?.trim() ? normalizeEmail(dto.email) : null;
      if (email) {
        if (seenEmails.has(email)) {
          throw new BadRequestException(`Row ${rowNum}: Duplicate email "${email}" in upload.`);
        }
        seenEmails.add(email);
      }

      let phone: string | null = null;
      if (dto.phone?.trim()) {
        phone = normalizeMobile(dto.phone);
        if (!phone) {
          throw new BadRequestException(`Row ${rowNum} (${firstName} ${lastName}): Invalid 10-digit mobile "${dto.phone}".`);
        }
        if (seenPhones.has(phone)) {
          throw new BadRequestException(`Row ${rowNum}: Duplicate mobile "${phone}" in upload.`);
        }
        seenPhones.add(phone);
      }

      const emergencyPhone = normalizeMobile(dto.emergencyPhone) ?? dto.emergencyPhone.trim();

      return {
        firstName,
        lastName,
        email,
        phone,
        quote,
        dob,
        age,
        gender: dto.gender.trim(),
        bloodGroup: dto.bloodGroup.trim(),
        tshirtSize: dto.tshirtSize.trim().toUpperCase(),
        bibName: (dto.bibName?.trim() || firstName).toUpperCase().slice(0, 14),
        emergencyName: dto.emergencyName.trim(),
        emergencyRelation: dto.emergencyRelation?.trim() || (ctx.role === Role.SCHOOL_COORDINATOR ? 'Parent / Guardian' : 'Colleague / Family'),
        emergencyPhone,
        medicalNotes: dto.medicalNotes?.trim() || null,
        city: dto.city?.trim() || ctx.city || 'Rajgir',
        state: dto.state?.trim() || 'Bihar',
        pincode: dto.pincode?.trim() || '803116',
      };
    });

    // Check existing email/phone collisions in DB before transaction
    if (seenEmails.size > 0) {
      const existingEmail = await this.prisma.user.findFirst({
        where: { email: { in: Array.from(seenEmails) } },
        select: { email: true },
      });
      if (existingEmail) {
        throw new ConflictException(`Email "${existingEmail.email}" is already registered on the platform.`);
      }
    }
    if (seenPhones.size > 0) {
      const existingPhone = await this.prisma.user.findFirst({
        where: { phone: { in: Array.from(seenPhones) } },
        select: { phone: true },
      });
      if (existingPhone) {
        throw new ConflictException(`Mobile "${existingPhone.phone}" is already linked to an existing account.`);
      }
    }

    const created = await this.prisma.$transaction(async (tx) => {
      const results = [];
      for (const item of prepared) {
        const runnerUser = await tx.user.create({
          data: {
            firstName: item.firstName,
            lastName: item.lastName,
            email: item.email,
            phone: item.phone,
            role: Role.RUNNER,
            status: 'ACTIVE',
            supabaseAuthId: null,
            registrationSource: ctx.source,
            registeredByUserId: userId,
          },
        });

        const reg = await tx.runnerRegistration.create({
          data: {
            userId: runnerUser.id,
            registrationNumber: this.generateRegNumber(item.quote.category.distance),
            distance: item.quote.category.distance,
            raceTitle: item.quote.category.title,
            baseFee: item.quote.category.fee,
            dateOfBirth: item.dob,
            ageOnRaceDay: item.age,
            gender: item.gender,
            bibName: item.bibName,
            bloodGroup: item.bloodGroup,
            tshirtSize: item.tshirtSize,
            emergencyName: item.emergencyName,
            emergencyRelation: item.emergencyRelation,
            emergencyPhone: item.emergencyPhone,
            medicalNotes: item.medicalNotes,
            city: item.city,
            state: item.state,
            pincode: item.pincode,
            country: 'India',
            runningClub: ctx.orgName,
            selectedAddons: [],
            grossAmount: item.quote.category.fee,
            discountAmount: 0,
            netAmount: item.quote.category.fee,
            waiverAgreed: true,
            paymentStatus: 'CONFIRMED',
          },
        });

        results.push({
          userId: runnerUser.id,
          ...identityOf(runnerUser),
          registrationSource: runnerUser.registrationSource,
          ...reg,
        });
      }
      return results;
    });

    this.logger.log(`${ctx.role} (${userId}) registered ${created.length} managed runner(s)`);
    return { success: true, count: created.length, runners: created };
  }

  /** Submit an appeal to Admin to raise the 50-runner cap. */
  async submitQuotaAppeal(userId: string, dto: SubmitQuotaAppealDto) {
    const ctx = await this.resolveGroupContext(userId);
    if (dto.requestedQuota <= ctx.profile.maxRunnerQuota) {
      throw new BadRequestException(`Requested quota must be greater than your current limit (${ctx.profile.maxRunnerQuota}).`);
    }

    const data = {
      appealRequestedQuota: dto.requestedQuota,
      appealReason: dto.reason.trim(),
      appealStatus: 'PENDING' as const,
      appealSubmittedAt: new Date(),
    };

    if (ctx.modelKey === 'teamProfile') {
      await this.prisma.teamProfile.update({ where: { userId }, data });
    } else if (ctx.modelKey === 'corporateProfile') {
      await this.prisma.corporateProfile.update({ where: { userId }, data });
    } else {
      await this.prisma.schoolProfile.update({ where: { userId }, data });
    }

    this.logger.log(`Quota appeal submitted by ${ctx.role} (${userId}): requested ${dto.requestedQuota}`);
    return { success: true, appealStatus: 'PENDING', appealRequestedQuota: dto.requestedQuota };
  }

  /** Update Group Profile & Coordinator Contact Info (SSOT on User). */
  async updateGroupProfile(userId: string, dto: UpdateGroupProfileDto) {
    const ctx = await this.resolveGroupContext(userId);
    const firstName = cleanNamePart(dto.firstName);
    const lastName = cleanNamePart(dto.lastName);
    const phone = dto.phone?.trim() ? normalizeMobile(dto.phone) : ctx.user.phone;
    if (dto.phone?.trim() && !phone) {
      throw new BadRequestException('Enter a valid 10-digit mobile number.');
    }

    try {
      const updated = await this.prisma.$transaction(async (tx) => {
        const user = await tx.user.update({
          where: { id: userId },
          data: { firstName, lastName, phone },
          select: IDENTITY_SELECT,
        });

        let profile: unknown;
        if (ctx.modelKey === 'teamProfile') {
          profile = await tx.teamProfile.update({
            where: { userId },
            data: {
              teamName: dto.organizationName?.trim() || ctx.profile.teamName,
              city: dto.city?.trim() || ctx.profile.city,
              notes: dto.notes !== undefined ? dto.notes.trim() || null : ctx.profile.notes,
            },
          });
        } else if (ctx.modelKey === 'corporateProfile') {
          profile = await tx.corporateProfile.update({
            where: { userId },
            data: {
              companyName: dto.organizationName?.trim() || ctx.profile.companyName,
              gstin: dto.gstin !== undefined ? dto.gstin.trim() || null : ctx.profile.gstin,
              billingAddress: dto.billingAddress !== undefined ? dto.billingAddress.trim() || null : ctx.profile.billingAddress,
              csrFocus: dto.notes !== undefined ? dto.notes.trim() || null : ctx.profile.csrFocus,
            },
          });
        } else {
          profile = await tx.schoolProfile.update({
            where: { userId },
            data: {
              schoolName: dto.organizationName?.trim() || ctx.profile.schoolName,
              city: dto.city?.trim() || ctx.profile.city,
              teacherInCharge: dto.teacherInCharge?.trim() || ctx.profile.teacherInCharge,
              teacherDesignation: dto.teacherDesignation?.trim() || ctx.profile.teacherDesignation,
            },
          });
        }

        return { identity: user, profile };
      });

      return { success: true, ...updated };
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new ConflictException('That mobile number is already linked to another account.');
      }
      throw err;
    }
  }

  /** Fetch Partner Dashboard (Sponsor, Vendor, Tourism). */
  async getPartnerDashboard(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        sponsorProfile: true,
        vendorProfile: true,
        tourismProfile: true,
      },
    });
    if (!user || !user.role || !PARTNER_ROLES.includes(user.role)) {
      throw new ForbiddenException('Only Sponsors, Vendors, and Tourism Partners can access partner operations.');
    }

    const profile =
      user.role === Role.SPONSOR
        ? user.sponsorProfile
        : user.role === Role.VENDOR
          ? user.vendorProfile
          : user.tourismProfile;
    if (!profile) throw new NotFoundException('Partner profile not found.');

    return {
      role: user.role,
      accountStatus: user.status,
      identity: identityOf(user),
      profile,
    };
  }

  /** Update Partner Profile & Contact Info (SSOT on User). */
  async updatePartnerProfile(userId: string, dto: UpdatePartnerProfileDto) {
    const current = await this.getPartnerDashboard(userId);
    const firstName = cleanNamePart(dto.firstName);
    const lastName = cleanNamePart(dto.lastName);
    const phone = dto.phone?.trim() ? normalizeMobile(dto.phone) : current.identity.phone;
    if (dto.phone?.trim() && !phone) {
      throw new BadRequestException('Enter a valid 10-digit mobile number.');
    }

    try {
      const updated = await this.prisma.$transaction(async (tx) => {
        const user = await tx.user.update({
          where: { id: userId },
          data: { firstName, lastName, phone },
          select: IDENTITY_SELECT,
        });

        let profile: unknown;
        if (current.role === Role.SPONSOR) {
          profile = await tx.sponsorProfile.update({
            where: { userId },
            data: {
              brandName: dto.businessName?.trim() || undefined,
              brandWebsite: dto.brandWebsite !== undefined ? dto.brandWebsite.trim() || null : undefined,
              proposalDeliverables: dto.proposalDeliverables !== undefined ? dto.proposalDeliverables.trim() || null : undefined,
            },
          });
        } else if (current.role === Role.VENDOR) {
          profile = await tx.vendorProfile.update({
            where: { userId },
            data: {
              businessName: dto.businessName?.trim() || undefined,
              fssaiNumber: dto.fssaiNumber !== undefined ? dto.fssaiNumber.trim() || null : undefined,
              electricPowerRequired: dto.electricPowerRequired,
            },
          });
        } else {
          profile = await tx.tourismProfile.update({
            where: { userId },
            data: {
              businessName: dto.businessName?.trim() || undefined,
              location: dto.location?.trim() || undefined,
              distanceFromStartLine: dto.distanceFromStartLine !== undefined ? dto.distanceFromStartLine.trim() || null : undefined,
              inventoryCapacity: dto.inventoryCapacity?.trim() || undefined,
              discountOffering: dto.discountOffering !== undefined ? dto.discountOffering.trim() || null : undefined,
            },
          });
        }

        return { identity: user, profile };
      });

      return { success: true, ...updated };
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new ConflictException('That mobile number is already linked to another account.');
      }
      throw err;
    }
  }
}
