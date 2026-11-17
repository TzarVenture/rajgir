import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { CreateInfluencerDto } from './dto/create-influencer.dto';

@Injectable()
export class InfluencersService {
  private readonly logger = new Logger(InfluencersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly users: UsersService,
  ) {}

  async registerInfluencer(userId: string, dto: CreateInfluencerDto) {
    await this.users.assertCanRegister(userId, Role.INFLUENCER);

    try {
      const record = await this.prisma.$transaction(async (tx) => {
        const created = await tx.influencer.create({
          data: {
            userId,
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
        await tx.user.update({ where: { id: userId }, data: { role: Role.INFLUENCER, status: 'PENDING_APPROVAL' } });
        return created;
      });

      this.logger.log(`Influencer registered: ${record.fullName} (${record.primaryPlatform})`);
      return {
        success: true,
        id: record.id,
        fullName: record.fullName,
        email: record.email,
        primaryPlatform: record.primaryPlatform,
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

  async listInfluencers(limit = 50, offset = 0) {
    const [total, influencers] = await Promise.all([
      this.prisma.influencer.count(),
      this.prisma.influencer.findMany({ take: limit, skip: offset, orderBy: { submittedAt: 'desc' } }),
    ]);
    return { total, count: influencers.length, influencers };
  }
}
