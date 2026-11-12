import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateInfluencerDto } from './dto/create-influencer.dto';
import { Role } from '@prisma/client';

@Injectable()
export class InfluencersService {
  private readonly logger = new Logger(InfluencersService.name);

  constructor(private readonly prisma: PrismaService) {}

  async registerInfluencer(dto: CreateInfluencerDto) {
    if (dto.userId) {
      const user = await this.prisma.user.findUnique({
        where: { id: dto.userId },
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
        throw new BadRequestException(`User account with ID ${dto.userId} does not exist.`);
      }

      if (user.role && user.role !== Role.INFLUENCER) {
        throw new BadRequestException(
          `This account is already registered as ${user.role}. Accounts are strictly limited to one role per phone/email.`,
        );
      }

      if (user.influencer) {
        throw new BadRequestException('This account already has a registered influencer proposal.');
      }
    }

    const record = await this.prisma.influencer.create({
      data: {
        userId: dto.userId || null,
        fullName: dto.fullName.trim(),
        stageName: dto.stageName?.trim() || null,
        email: dto.email.toLowerCase().trim(),
        phone: dto.phone.trim(),
        city: dto.city?.trim() || null,
        country: dto.country?.trim() || 'India',
        primaryPlatform: dto.primaryPlatform,
        profileUrl: dto.profileUrl.trim(),
        followerCount: dto.followerCount.trim(),
        engagementRate: dto.engagementRate?.trim() || null,
        targetNiche: dto.targetNiche.trim(),
        collaborationDeliverables: dto.collaborationDeliverables.trim(),
        status: 'pending',
      },
    });

    if (dto.userId) {
      await this.prisma.user.update({
        where: { id: dto.userId },
        data: {
          role: Role.INFLUENCER,
          status: 'PENDING_APPROVAL',
        },
      });
    }

    this.logger.log(`Influencer registered: ${record.fullName} (${record.primaryPlatform}: ${record.profileUrl})`);

    return {
      success: true,
      id: record.id,
      fullName: record.fullName,
      email: record.email,
      primaryPlatform: record.primaryPlatform,
      status: record.status,
      submittedAt: record.submittedAt,
    };
  }

  async listInfluencers(limit = 50, offset = 0) {
    const [total, influencers] = await Promise.all([
      this.prisma.influencer.count(),
      this.prisma.influencer.findMany({
        take: limit,
        skip: offset,
        orderBy: { submittedAt: 'desc' },
      }),
    ]);

    return { total, count: influencers.length, influencers };
  }
}

