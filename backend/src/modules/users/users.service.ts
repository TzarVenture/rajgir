import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SyncUserDto } from './dto/sync-user.dto';
import { Role } from '@prisma/client';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly prisma: PrismaService) {}

  async syncUser(dto: SyncUserDto) {
    const cleanEmail = dto.email.toLowerCase().trim();
    const cleanPhone = dto.phone ? dto.phone.replace(/\D/g, '').trim() : null;

    // Check by email or supabaseAuthId
    let user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: cleanEmail },
          ...(dto.supabaseAuthId ? [{ supabaseAuthId: dto.supabaseAuthId }] : []),
        ],
      },
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

    if (user) {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          fullName: dto.fullName.trim() || user.fullName,
          phone: cleanPhone || user.phone,
          supabaseAuthId: dto.supabaseAuthId || user.supabaseAuthId,
        },
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
      return user;
    }

    // Check if phone is already taken by another user
    if (cleanPhone) {
      const existingPhone = await this.prisma.user.findUnique({
        where: { phone: cleanPhone },
      });
      if (existingPhone) {
        throw new BadRequestException(
          `Phone number ${cleanPhone} is already registered under another account with role ${existingPhone.role || 'Unassigned'}.`,
        );
      }
    }

    user = await this.prisma.user.create({
      data: {
        email: cleanEmail,
        phone: cleanPhone,
        fullName: dto.fullName.trim(),
        supabaseAuthId: dto.supabaseAuthId || null,
        status: 'PENDING_ONBOARDING',
      },
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

    this.logger.log(`Created new synced user: ${user.email} (ID: ${user.id})`);
    return user;
  }

  async checkUser(email?: string, phone?: string) {
    if (!email && !phone) {
      return { exists: false };
    }

    const cleanEmail = email ? email.toLowerCase().trim() : undefined;
    const cleanPhone = phone ? phone.replace(/\D/g, '').trim() : undefined;

    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          ...(cleanEmail ? [{ email: cleanEmail }] : []),
          ...(cleanPhone ? [{ phone: cleanPhone }] : []),
        ],
      },
      select: {
        id: true,
        email: true,
        phone: true,
        fullName: true,
        role: true,
        status: true,
      },
    });

    if (!user) {
      return { exists: false };
    }

    return {
      exists: true,
      userId: user.id,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
    };
  }

  async getUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
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
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async getUserByEmail(email: string) {
    const cleanEmail = email.toLowerCase().trim();
    const user = await this.prisma.user.findUnique({
      where: { email: cleanEmail },
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
      throw new NotFoundException(`User with email ${email} not found`);
    }

    return user;
  }

  async setRole(userId: string, requestedRole: Role) {
    const user = await this.getUserById(userId);

    // 1 User = 1 Role check:
    // If the user already has a role and has completed that profile, block switching
    if (user.role && user.role !== requestedRole) {
      const hasCompletedProfile =
        user.runnerRegistration ||
        user.volunteer ||
        user.influencer ||
        user.teamProfile ||
        user.corporateProfile ||
        user.schoolProfile ||
        user.sponsorProfile ||
        user.vendorProfile ||
        user.tourismProfile;

      if (hasCompletedProfile) {
        throw new BadRequestException(
          `This account is permanently assigned to role ${user.role}. Accounts are strictly limited to one role. Please use a separate account for ${requestedRole}.`,
        );
      }
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        role: requestedRole,
      },
    });

    this.logger.log(`User ${user.email} intent set to role ${requestedRole}`);
    return updated;
  }
}

