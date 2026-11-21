import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { IDENTITY_SELECT, UsersService, displayName, withIdentity } from '../users/users.service';
import { CreateInfluencerDto } from './dto/create-influencer.dto';

@Injectable()
export class InfluencersService {
  private readonly logger = new Logger(InfluencersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly users: UsersService,
  ) {}

  /**
   * Register the signed-in user as an influencer (waits for approval).
   * Identity comes from the account; eligibility, profile and role change are one transaction.
   */
  async registerInfluencer(userId: string, dto: CreateInfluencerDto) {
    try {
      const { profile: record, user } = await this.users.createRoleProfile(userId, Role.INFLUENCER, 'PENDING_APPROVAL', (tx) =>
        tx.influencer.create({
          data: {
            userId,
            stageName: dto.stageName?.trim() || null,
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
        }),
      );

      this.logger.log(`Influencer registered: ${record.id} (${record.primaryPlatform}, user ${userId})`);
      return {
        success: true,
        id: record.id,
        fullName: displayName(user),
        email: user.email,
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
    const [total, rows] = await Promise.all([
      this.prisma.influencer.count(),
      this.prisma.influencer.findMany({
        take: limit,
        skip: offset,
        orderBy: { submittedAt: 'desc' },
        include: { user: { select: IDENTITY_SELECT } },
      }),
    ]);
    const influencers = rows.map(withIdentity);
    return { total, count: influencers.length, influencers };
  }
}
