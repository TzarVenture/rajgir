import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterTeamDto } from './dto/register-team.dto';
import { RegisterCorporateDto } from './dto/register-corporate.dto';
import { RegisterSchoolDto } from './dto/register-school.dto';
import { RegisterSponsorDto } from './dto/register-sponsor.dto';
import { RegisterVendorDto } from './dto/register-vendor.dto';
import { RegisterTourismDto } from './dto/register-tourism.dto';
import { Role } from '@prisma/client';

@Injectable()
export class RegistrationsService {
  private readonly logger = new Logger(RegistrationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  private async validateAndPrepareUser(userId: string, expectedRole: Role) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        runnerRegistration: true,
        volunteer: true,
        influencer: true,
        teamProfile: true,
        corporateProfile: true,
        schoolProfile: true,
        sponsorProfile: true,
        vendorProfile: true,
        tourismProfile: true,
      },
    });

    if (!user) {
      throw new BadRequestException(`User account with ID ${userId} does not exist.`);
    }

    // 1 User = 1 Role check:
    if (user.role && user.role !== expectedRole) {
      const hasOtherProfile =
        user.runnerRegistration ||
        user.volunteer ||
        user.influencer ||
        user.teamProfile ||
        user.corporateProfile ||
        user.schoolProfile ||
        user.sponsorProfile ||
        user.vendorProfile ||
        user.tourismProfile;

      if (hasOtherProfile) {
        throw new BadRequestException(
          `This account is already registered as ${user.role}. Accounts are strictly limited to one role per phone/email.`,
        );
      }
    }

    return user;
  }

  // --- 1. TEAM CAPTAIN REGISTRATION ---
  async registerTeam(dto: RegisterTeamDto) {
    const user = await this.validateAndPrepareUser(dto.userId, Role.TEAM_CAPTAIN);

    if (user.teamProfile) {
      throw new BadRequestException('This account already has a registered team profile.');
    }

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const teamJoinCode = `TEAM-${randomSuffix}`;

    const profile = await this.prisma.teamProfile.create({
      data: {
        userId: user.id,
        teamName: dto.teamName.trim(),
        clubAffiliation: dto.clubAffiliation?.trim() || null,
        city: dto.city.trim(),
        teamJoinCode,
        estimatedMembers: dto.estimatedMembers,
        notes: dto.notes?.trim() || null,
      },
    });

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        role: Role.TEAM_CAPTAIN,
        status: 'ACTIVE',
      },
    });

    this.logger.log(`Team created: ${profile.teamName} by ${user.email} (Code: ${teamJoinCode})`);
    return { success: true, profile, teamJoinCode };
  }

  // --- 2. CORPORATE REGISTRATION ---
  async registerCorporate(dto: RegisterCorporateDto) {
    const user = await this.validateAndPrepareUser(dto.userId, Role.CORPORATE_MANAGER);

    if (user.corporateProfile) {
      throw new BadRequestException('This account already has a registered corporate profile.');
    }

    const profile = await this.prisma.corporateProfile.create({
      data: {
        userId: user.id,
        companyName: dto.companyName.trim(),
        gstin: dto.gstin?.trim() || null,
        officialEmailDomain: dto.officialEmailDomain.trim(),
        designation: dto.designation.trim(),
        estimatedPasses: dto.estimatedPasses,
        csrFocus: dto.csrFocus?.trim() || null,
        billingAddress: dto.billingAddress?.trim() || null,
        status: 'pending',
      },
    });

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        role: Role.CORPORATE_MANAGER,
        status: 'PENDING_APPROVAL',
      },
    });

    this.logger.log(`Corporate application submitted: ${profile.companyName} by ${user.email}`);
    return { success: true, profile };
  }

  // --- 3. SCHOOL REGISTRATION ---
  async registerSchool(dto: RegisterSchoolDto) {
    const user = await this.validateAndPrepareUser(dto.userId, Role.SCHOOL_COORDINATOR);

    if (user.schoolProfile) {
      throw new BadRequestException('This account already has a registered school profile.');
    }

    const profile = await this.prisma.schoolProfile.create({
      data: {
        userId: user.id,
        schoolName: dto.schoolName.trim(),
        boardAffiliation: dto.boardAffiliation.trim(),
        city: dto.city.trim(),
        teacherInCharge: dto.teacherInCharge.trim(),
        teacherDesignation: dto.teacherDesignation.trim(),
        estimatedStudents: dto.estimatedStudents,
        parentalConsentAgreed: dto.parentalConsentAgreed,
        status: 'pending',
      },
    });

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        role: Role.SCHOOL_COORDINATOR,
        status: 'PENDING_APPROVAL',
      },
    });

    this.logger.log(`School application submitted: ${profile.schoolName} by ${user.email}`);
    return { success: true, profile };
  }

  // --- 4. SPONSOR REGISTRATION ---
  async registerSponsor(dto: RegisterSponsorDto) {
    const user = await this.validateAndPrepareUser(dto.userId, Role.SPONSOR);

    if (user.sponsorProfile) {
      throw new BadRequestException('This account already has a registered sponsor proposal.');
    }

    const profile = await this.prisma.sponsorProfile.create({
      data: {
        userId: user.id,
        brandName: dto.brandName.trim(),
        industry: dto.industry.trim(),
        tierInterest: dto.tierInterest.trim(),
        budgetBand: dto.budgetBand.trim(),
        brandWebsite: dto.brandWebsite?.trim() || null,
        proposalDeliverables: dto.proposalDeliverables?.trim() || null,
        status: 'pending',
      },
    });

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        role: Role.SPONSOR,
        status: 'PENDING_APPROVAL',
      },
    });

    this.logger.log(`Sponsor proposal submitted: ${profile.brandName} by ${user.email}`);
    return { success: true, profile };
  }

  // --- 5. VENDOR REGISTRATION ---
  async registerVendor(dto: RegisterVendorDto) {
    const user = await this.validateAndPrepareUser(dto.userId, Role.VENDOR);

    if (user.vendorProfile) {
      throw new BadRequestException('This account already has a registered vendor stall booking.');
    }

    const profile = await this.prisma.vendorProfile.create({
      data: {
        userId: user.id,
        businessName: dto.businessName.trim(),
        stallCategory: dto.stallCategory.trim(),
        stallSize: dto.stallSize.trim(),
        fssaiNumber: dto.fssaiNumber?.trim() || null,
        electricPowerRequired: dto.electricPowerRequired,
        status: 'pending',
      },
    });

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        role: Role.VENDOR,
        status: 'PENDING_APPROVAL',
      },
    });

    this.logger.log(`Vendor booth application submitted: ${profile.businessName} by ${user.email}`);
    return { success: true, profile };
  }

  // --- 6. TOURISM PARTNER REGISTRATION ---
  async registerTourism(dto: RegisterTourismDto) {
    const user = await this.validateAndPrepareUser(dto.userId, Role.TOURISM_PARTNER);

    if (user.tourismProfile) {
      throw new BadRequestException('This account already has a registered tourism partner profile.');
    }

    const profile = await this.prisma.tourismProfile.create({
      data: {
        userId: user.id,
        businessName: dto.businessName.trim(),
        serviceType: dto.serviceType.trim(),
        location: dto.location.trim(),
        distanceFromStartLine: dto.distanceFromStartLine?.trim() || null,
        inventoryCapacity: dto.inventoryCapacity.trim(),
        discountOffering: dto.discountOffering?.trim() || null,
        status: 'pending',
      },
    });

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        role: Role.TOURISM_PARTNER,
        status: 'PENDING_APPROVAL',
      },
    });

    this.logger.log(`Tourism partner listing submitted: ${profile.businessName} by ${user.email}`);
    return { success: true, profile };
  }
}

