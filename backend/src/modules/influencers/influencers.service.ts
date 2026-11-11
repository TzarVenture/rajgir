import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateInfluencerDto } from './dto/create-influencer.dto';

@Injectable()
export class InfluencersService {
  private readonly logger = new Logger(InfluencersService.name);

  constructor(private readonly prisma: PrismaService) {}

  async registerInfluencer(dto: CreateInfluencerDto) {
    const record = await this.prisma.influencer.create({
      data: {
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

