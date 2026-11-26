import { BadRequestException, ConflictException, Injectable, Logger } from '@nestjs/common';
import { AccountStatus, Prisma, Role } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { RegisterGroupWithAccountDto } from './dto/register-group-with-account.dto';
import { RegisterTeamDto } from './dto/register-team.dto';
import { RegisterCorporateDto } from './dto/register-corporate.dto';
import { RegisterSchoolDto } from './dto/register-school.dto';
import { RegisterSponsorDto } from './dto/register-sponsor.dto';
import { RegisterVendorDto } from './dto/register-vendor.dto';
import { RegisterTourismDto } from './dto/register-tourism.dto';

/**
 * Group and partner registrations.
 * Every method: the signed-in user comes from the token (never the request body), one registration per
 * account is enforced, and the profile + the user's role/status are saved together in one transaction.
 */
@Injectable()
export class RegistrationsService {
  private readonly logger = new Logger(RegistrationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly users: UsersService,
  ) {}

  private async submit<T>(
    userId: string,
    role: Role,
    status: AccountStatus,
    create: (tx: Prisma.TransactionClient) => Promise<T>,
  ): Promise<T> {
    try {
      const { profile } = await this.users.createRoleProfile(userId, role, status, create);
      return profile;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('You have already submitted this registration.');
      }
      throw error;
    }
  }

  /** The signed-in user's registration (if any), for "you are registered" screens and dashboards. */
  async getMine(userId: string) {
    const registration = await this.users.getRegistration(userId);
    if (!registration) return { registered: false as const };
    return { registered: true as const, ...registration };
  }

  withdrawMine(userId: string) {
    return this.users.withdrawRegistration(userId);
  }

  /** Atomically create account and group/partner profile in a single database transaction. */
  async registerGroupWithAccount(
    type: 'team' | 'corporate' | 'school' | 'sponsor' | 'vendor' | 'tourism',
    dto: RegisterGroupWithAccountDto,
  ) {
    const roleMap: Record<string, Role> = {
      team: Role.TEAM_CAPTAIN,
      corporate: Role.CORPORATE_MANAGER,
      school: Role.SCHOOL_COORDINATOR,
      sponsor: Role.SPONSOR,
      vendor: Role.VENDOR,
      tourism: Role.TOURISM_PARTNER,
    };
    const role = roleMap[type];
    if (!role) throw new BadRequestException(`Unknown group registration type: ${type}`);

    const isInstant = type === 'team';
    const status: AccountStatus = isInstant ? 'ACTIVE' : 'PENDING_APPROVAL';

    let teamJoinCode: string | undefined;
    if (type === 'team') {
      teamJoinCode = await this.freeTeamJoinCode();
    }

    try {
      const { user, profile, session } = await this.users.createAccountAndRoleProfile(
        { ...dto.account, role },
        async (tx, user) => {
          const reg = dto.registration;
          switch (type) {
            case 'team': {
              const members = Math.min(50, Math.max(2, Number(reg.estimatedMembers) || 10));
              return tx.teamProfile.create({
                data: {
                  userId: user.id,
                  teamName: String(reg.teamName).trim(),
                  teamJoinCode: teamJoinCode!,
                  estimatedMembers: members,
                  city: reg.city ? String(reg.city).trim() : null,
                },
              });
            }
            case 'corporate': {
              const passes = Math.min(50, Math.max(5, Number(reg.estimatedPasses) || 10));
              return tx.corporateProfile.create({
                data: {
                  userId: user.id,
                  companyName: String(reg.companyName).trim(),
                  officialEmailDomain: String(reg.officialEmailDomain || '').trim(),
                  designation: String(reg.designation).trim(),
                  estimatedPasses: passes,
                  gstin: reg.gstin ? String(reg.gstin).trim() : null,
                  csrFocus: reg.csrFocus ? String(reg.csrFocus).trim() : null,
                  billingAddress: reg.billingAddress ? String(reg.billingAddress).trim() : null,
                  status: 'pending',
                },
              });
            }
            case 'school': {
              const students = Math.min(50, Math.max(5, Number(reg.estimatedStudents) || 50));
              return tx.schoolProfile.create({
                data: {
                  userId: user.id,
                  schoolName: String(reg.schoolName).trim(),
                  boardAffiliation: String(reg.boardAffiliation || 'CBSE').trim(),
                  city: String(reg.city || 'Rajgir').trim(),
                  teacherInCharge: String(reg.teacherInCharge || '').trim(),
                  teacherDesignation: String(reg.teacherDesignation || '').trim(),
                  estimatedStudents: students,
                  parentalConsentAgreed: Boolean(reg.parentalConsentAgreed),
                  status: 'pending',
                },
              });
            }
            case 'sponsor':
              return tx.sponsorProfile.create({
                data: {
                  userId: user.id,
                  brandName: String(reg.brandName).trim(),
                  industry: String(reg.industry || '').trim(),
                  tierInterest: String(reg.tierInterest).trim(),
                  budgetBand: String(reg.budgetBand || '').trim(),
                  brandWebsite: reg.brandWebsite ? String(reg.brandWebsite).trim() : null,
                  proposalDeliverables: reg.proposalDeliverables ? String(reg.proposalDeliverables).trim() : null,
                  status: 'pending',
                },
              });
            case 'vendor':
              return tx.vendorProfile.create({
                data: {
                  userId: user.id,
                  businessName: String(reg.businessName).trim(),
                  stallCategory: String(reg.stallCategory || 'Food').trim(),
                  stallSize: String(reg.stallSize || 'Standard').trim(),
                  fssaiNumber: reg.fssaiNumber ? String(reg.fssaiNumber).trim() : null,
                  electricPowerRequired: Boolean(reg.electricPowerRequired),
                  status: 'pending',
                },
              });
            case 'tourism':
              return tx.tourismProfile.create({
                data: {
                  userId: user.id,
                  businessName: String(reg.businessName).trim(),
                  serviceType: String(reg.serviceType).trim(),
                  location: String(reg.location || 'Rajgir').trim(),
                  distanceFromStartLine: reg.distanceFromStartLine ? String(reg.distanceFromStartLine).trim() : null,
                  inventoryCapacity: String(reg.inventoryCapacity || '10').trim(),
                  discountOffering: reg.discountOffering ? String(reg.discountOffering).trim() : null,
                  status: 'pending',
                },
              });
          }
        },
      );

      return {
        success: true,
        profile,
        teamJoinCode,
        session,
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('You have already submitted this registration.');
      }
      throw error;
    }
  }

  // --- 1. TEAM / RUNNING CLUB (active straight away) ---
  private async freeTeamJoinCode(): Promise<string> {
    for (let attempt = 0; attempt < 10; attempt++) {
      const code = `TEAM-${Math.floor(1000 + Math.random() * 9000)}`;
      const taken = await this.prisma.teamProfile.findUnique({ where: { teamJoinCode: code } });
      if (!taken) return code;
    }
    return `TEAM-${Date.now().toString(36).toUpperCase().slice(-6)}`;
  }

  async registerTeam(userId: string, dto: RegisterTeamDto) {
    const teamJoinCode = await this.freeTeamJoinCode();
    const profile = await this.submit(userId, Role.TEAM_CAPTAIN, 'ACTIVE', (tx) =>
      tx.teamProfile.create({
        data: {
          userId,
          teamName: dto.teamName.trim(),
          clubAffiliation: dto.clubAffiliation?.trim() || null,
          city: dto.city.trim(),
          teamJoinCode,
          estimatedMembers: dto.estimatedMembers,
          notes: dto.notes?.trim() || null,
        },
      }),
    );
    this.logger.log(`Team created: ${profile.teamName} (Code: ${teamJoinCode})`);
    return { success: true, profile, teamJoinCode };
  }

  // --- 2. CORPORATE ---
  async registerCorporate(userId: string, dto: RegisterCorporateDto) {
    const profile = await this.submit(userId, Role.CORPORATE_MANAGER, 'PENDING_APPROVAL', (tx) =>
      tx.corporateProfile.create({
        data: {
          userId,
          companyName: dto.companyName.trim(),
          gstin: dto.gstin?.trim() || null,
          officialEmailDomain: dto.officialEmailDomain.trim(),
          designation: dto.designation.trim(),
          estimatedPasses: dto.estimatedPasses,
          csrFocus: dto.csrFocus?.trim() || null,
          billingAddress: dto.billingAddress?.trim() || null,
          status: 'pending',
        },
      }),
    );
    this.logger.log(`Corporate application submitted: ${profile.companyName}`);
    return { success: true, profile };
  }

  // --- 3. SCHOOL / COLLEGE ---
  async registerSchool(userId: string, dto: RegisterSchoolDto) {
    const profile = await this.submit(userId, Role.SCHOOL_COORDINATOR, 'PENDING_APPROVAL', (tx) =>
      tx.schoolProfile.create({
        data: {
          userId,
          schoolName: dto.schoolName.trim(),
          boardAffiliation: dto.boardAffiliation.trim(),
          city: dto.city.trim(),
          teacherInCharge: dto.teacherInCharge.trim(),
          teacherDesignation: dto.teacherDesignation.trim(),
          estimatedStudents: dto.estimatedStudents,
          parentalConsentAgreed: dto.parentalConsentAgreed,
          status: 'pending',
        },
      }),
    );
    this.logger.log(`School application submitted: ${profile.schoolName}`);
    return { success: true, profile };
  }

  // --- 4. SPONSOR ---
  async registerSponsor(userId: string, dto: RegisterSponsorDto) {
    const profile = await this.submit(userId, Role.SPONSOR, 'PENDING_APPROVAL', (tx) =>
      tx.sponsorProfile.create({
        data: {
          userId,
          brandName: dto.brandName.trim(),
          industry: dto.industry.trim(),
          tierInterest: dto.tierInterest.trim(),
          budgetBand: dto.budgetBand.trim(),
          brandWebsite: dto.brandWebsite?.trim() || null,
          proposalDeliverables: dto.proposalDeliverables?.trim() || null,
          status: 'pending',
        },
      }),
    );
    this.logger.log(`Sponsor proposal submitted: ${profile.brandName}`);
    return { success: true, profile };
  }

  // --- 5. VENDOR (expo / food stall) ---
  async registerVendor(userId: string, dto: RegisterVendorDto) {
    const profile = await this.submit(userId, Role.VENDOR, 'PENDING_APPROVAL', (tx) =>
      tx.vendorProfile.create({
        data: {
          userId,
          businessName: dto.businessName.trim(),
          stallCategory: dto.stallCategory.trim(),
          stallSize: dto.stallSize.trim(),
          fssaiNumber: dto.fssaiNumber?.trim() || null,
          electricPowerRequired: dto.electricPowerRequired,
          status: 'pending',
        },
      }),
    );
    this.logger.log(`Vendor application submitted: ${profile.businessName}`);
    return { success: true, profile };
  }

  // --- 6. TOURISM PARTNER ---
  async registerTourism(userId: string, dto: RegisterTourismDto) {
    const profile = await this.submit(userId, Role.TOURISM_PARTNER, 'PENDING_APPROVAL', (tx) =>
      tx.tourismProfile.create({
        data: {
          userId,
          businessName: dto.businessName.trim(),
          serviceType: dto.serviceType.trim(),
          location: dto.location.trim(),
          distanceFromStartLine: dto.distanceFromStartLine?.trim() || null,
          inventoryCapacity: dto.inventoryCapacity.trim(),
          discountOffering: dto.discountOffering?.trim() || null,
          status: 'pending',
        },
      }),
    );
    this.logger.log(`Tourism partner listing submitted: ${profile.businessName}`);
    return { success: true, profile };
  }
}
