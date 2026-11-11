import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getPlatformOverview() {
    const [
      runnersCount,
      volunteersCount,
      influencersCount,
      revenueResult,
      runnersByCategory,
    ] = await Promise.all([
      this.prisma.runnerRegistration.count(),
      this.prisma.volunteer.count(),
      this.prisma.influencer.count(),
      this.prisma.runnerRegistration.aggregate({
        _sum: { netAmount: true },
      }),
      this.prisma.runnerRegistration.groupBy({
        by: ['distance'],
        _count: { id: true },
      }),
    ]);

    return {
      totalRunners: runnersCount,
      totalVolunteers: volunteersCount,
      totalInfluencers: influencersCount,
      totalRevenue: revenueResult._sum.netAmount || 0,
      categoryBreakdown: runnersByCategory.map((c) => ({
        distance: c.distance,
        count: c._count.id,
      })),
    };
  }
}
