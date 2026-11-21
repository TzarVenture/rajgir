import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { IDENTITY_SELECT, UsersService, displayName, withIdentity } from '../users/users.service';
import { CreateInfluencerDto, RegisterInfluencerWithAccountDto } from './dto/create-influencer.dto';

@Injectable()
export class InfluencersService {
  private readonly logger = new Logger(InfluencersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly users: UsersService,
  ) {}

  /** Atomically create account and influencer registration in a single database transaction. */
  async registerInfluencerWithAccount(dto: RegisterInfluencerWithAccountDto) {
    try {
      const { user, profile: record, session } = await this.users.createAccountAndRoleProfile(
        { ...dto.account, role: Role.INFLUENCER },
        (tx, user) =>
          tx.influencer.create({
            data: {
              userId: user.id,
              stageName: dto.registration.stageName?.trim() || null,
              city: dto.registration.city?.trim() || null,
              country: dto.registration.country?.trim() || 'India',
              primaryPlatform: dto.registration.primaryPlatform,
              profileUrl: dto.registration.profileUrl.trim(),
              followerCount: dto.registration.followerCount.trim(),
              engagementRate: dto.registration.engagementRate?.trim() || null,
              targetNiche: dto.registration.targetNiche.trim(),
              collaborationDeliverables: dto.registration.collaborationDeliverables.trim(),
              status: 'pending',
            },
          }),
      );

      this.logger.log(`Influencer registered with account: ${record.id} (${record.primaryPlatform}, user ${user.id})`);
      return {
        success: true,
        id: record.id,
        fullName: displayName(user),
        email: user.email,
        primaryPlatform: record.primaryPlatform,
        status: record.status,
        submittedAt: record.submittedAt,
        session,
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('You have already submitted this registration.');
      }
      throw error;
    }
  }

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
