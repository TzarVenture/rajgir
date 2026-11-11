import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateVolunteerDto } from './dto/create-volunteer.dto';

@Injectable()
export class VolunteersService {
  private readonly logger = new Logger(VolunteersService.name);

  constructor(private readonly prisma: PrismaService) {}

  async registerVolunteer(dto: CreateVolunteerDto) {
    const record = await this.prisma.volunteer.create({
      data: {
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

