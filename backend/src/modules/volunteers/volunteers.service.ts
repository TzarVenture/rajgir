import { BadRequestException, ConflictException, Injectable, Logger } from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { CreateVolunteerDto } from './dto/create-volunteer.dto';

@Injectable()
export class VolunteersService {
  private readonly logger = new Logger(VolunteersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly users: UsersService,
  ) {}

  async registerVolunteer(userId: string, dto: CreateVolunteerDto) {
    await this.users.assertCanRegister(userId, Role.VOLUNTEER);
    if (!dto.waiverAgreed) throw new BadRequestException('You must accept the volunteer waiver to register.');

    try {
      const record = await this.prisma.$transaction(async (tx) => {
        const created = await tx.volunteer.create({
          data: {
            userId,
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
            waiverAgreed: true,
            status: 'pending',
          },
        });
        await tx.user.update({ where: { id: userId }, data: { role: Role.VOLUNTEER, status: 'PENDING_APPROVAL' } });
        return created;
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
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('You have already submitted this registration.');
      }
      throw error;
    }
  }

  async listVolunteers(limit = 50, offset = 0) {
    const [total, volunteers] = await Promise.all([
      this.prisma.volunteer.count(),
      this.prisma.volunteer.findMany({ take: limit, skip: offset, orderBy: { submittedAt: 'desc' } }),
    ]);
    return { total, count: volunteers.length, volunteers };
  }
}
