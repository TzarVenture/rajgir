import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRunnerDto } from './dto/create-runner.dto';

@Injectable()
export class RunnersService {
  private readonly logger = new Logger(RunnersService.name);

  constructor(private readonly prisma: PrismaService) {}

  private generateRegistrationNumber(distance: string): string {
    const cleanDist = distance.replace(/[^0-9]/g, '');
    const prefix = cleanDist ? `${cleanDist}K` : 'OPEN';
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    return `RJG-2027-${prefix}-${randomSuffix}`;
  }

  private calculateAge(dob: Date): number {
    const raceDay = new Date('2027-01-24');
    let age = raceDay.getFullYear() - dob.getFullYear();
    const monthDiff = raceDay.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && raceDay.getDate() < dob.getDate())) {
      age--;
    }
    return Math.max(0, age);
  }

  async registerRunner(dto: CreateRunnerDto) {
    try {
      const registrationNumber = this.generateRegistrationNumber(dto.categoryDistance);

      const parsedDob = new Date(dto.dateOfBirth);
      if (isNaN(parsedDob.getTime())) {
        throw new BadRequestException('Invalid date of birth');
      }

      const ageOnRaceDay = this.calculateAge(parsedDob);
      const grossAmount = dto.registrationFee;
      const discountAmount = 0;
      const netAmount = grossAmount - discountAmount;

      const record = await this.prisma.runnerRegistration.create({
        data: {
          registrationNumber,
          distance: dto.categoryDistance,
          raceTitle: dto.categoryTitle,
          baseFee: dto.registrationFee,
          firstName: dto.firstName.trim(),
          lastName: dto.lastName.trim(),
          email: dto.email.toLowerCase().trim(),
          phone: dto.phone.trim(),
          dateOfBirth: parsedDob,
          ageOnRaceDay,
          gender: dto.gender,
          bloodGroup: dto.bloodGroup,
          tshirtSize: dto.tshirtSize,
          bibName: dto.bibName.toUpperCase().trim(),
          emergencyName: dto.emergencyName.trim(),
          emergencyRelation: dto.emergencyRelation,
          emergencyPhone: dto.emergencyPhone.trim(),
          medicalNotes: dto.medicalNotes?.trim() || null,
          city: dto.city.trim(),
          state: dto.state.trim(),
          pincode: dto.pincode.trim(),
          country: dto.country?.trim() || 'India',
          runningClub: dto.runningClub?.trim() || null,
          selectedAddons: dto.selectedAddons || [],
          grossAmount,
          discountAmount,
          netAmount,
          couponCode: dto.couponCode?.trim() || null,
          waiverAgreed: dto.waiverAgreed,
          paymentStatus: 'CONFIRMED',
        },
      });

      this.logger.log(`Runner registered successfully: ${record.registrationNumber} (${record.email})`);

      return {
        success: true,
        registrationNumber: record.registrationNumber,
        runnerName: `${record.firstName} ${record.lastName}`,
        bibName: record.bibName,
        distance: record.distance,
        raceTitle: record.raceTitle,
        email: record.email,
        paymentStatus: record.paymentStatus,
        createdAt: record.createdAt,
      };
    } catch (error) {
      this.logger.error('Failed to register runner', error);
      throw error;
    }
  }

  async getRegistrationByNumber(registrationNumber: string) {
    const record = await this.prisma.runnerRegistration.findUnique({
      where: { registrationNumber },
    });
    if (!record) {
      throw new BadRequestException('Registration not found');
    }
    return record;
  }

  async listRunners(limit = 50, offset = 0) {
    const [total, runners] = await Promise.all([
      this.prisma.runnerRegistration.count(),
      this.prisma.runnerRegistration.findMany({
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return { total, count: runners.length, runners };
  }
}
