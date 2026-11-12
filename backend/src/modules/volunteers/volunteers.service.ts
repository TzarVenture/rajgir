import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateVolunteerDto } from './dto/create-volunteer.dto';
import { Role } from '@prisma/client';

@Injectable()
export class VolunteersService {
  private readonly logger = new Logger(VolunteersService.name);

  constructor(private readonly prisma: PrismaService) {}

  async registerVolunteer(dto: CreateVolunteerDto) {
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

      if (user.role && user.role !== Role.VOLUNTEER) {
        throw new BadRequestException(
          `This account is already registered as ${user.role}. Accounts are strictly limited to one role per phone/email.`,
        );
      }

      if (user.volunteer) {
        throw new BadRequestException('This account already has a registered volunteer application.');
      }
    }

    const record = await this.prisma.volunteer.create({
      data: {
        userId: dto.userId || null,
        fullName: dto.fullName.trim(),
        email: dto.email.toLowerCase().trim(),
        phone: dto.phone.trim(),
        tShirtSize: dto.tShirtSize,
        emergencyContactName: dto.emergencyContactName.trim(),
        emergencyContactPhone: dto.emergencyContactPhone.trim(),
        availability: dto.availability || [],
        rolePreference: dto.rolePreference,
        languagesSpoken: dto.languagesSpoken?.trim() || null,
        dietaryRestrictions: dto.dietaryRestrictions?.trim() || null,
        medicalCertification: dto.medicalCertification || false,
        waiverAgreed: dto.waiverAgreed,
        status: 'pending',
      },
    });

    if (dto.userId) {
      await this.prisma.user.update({
        where: { id: dto.userId },
        data: {
          role: Role.VOLUNTEER,
          status: 'PENDING_APPROVAL',
        },
      });
    }

    this.logger.log(`Volunteer registered: ${record.fullName} (${record.email})`);

    return {
      success: true,
      id: record.id,
      fullName: record.fullName,
      email: record.email,
      rolePreference: record.rolePreference,
      status: record.status,
      submittedAt: record.submittedAt,
    };
  }

  async listVolunteers(limit = 50, offset = 0) {
    const [total, volunteers] = await Promise.all([
      this.prisma.volunteer.count(),
      this.prisma.volunteer.findMany({
        take: limit,
        skip: offset,
        orderBy: { submittedAt: 'desc' },
      }),
    ]);

    return { total, count: volunteers.length, volunteers };
  }
}

