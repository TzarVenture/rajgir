import { BadRequestException, ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { STAFF_ROLES } from '../../common/constants/roles';
import { UsersService } from '../users/users.service';
import { CreateRunnerDto } from './dto/create-runner.dto';
import { quotePrice } from './pricing';

@Injectable()
export class RunnersService {
  private readonly logger = new Logger(RunnersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly users: UsersService,
  ) {}

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

  /** Register the signed-in user as a runner. Price, age and role are all decided here, on the server. */
  async registerRunner(userId: string, dto: CreateRunnerDto) {
    await this.users.assertCanRegister(userId, Role.RUNNER);

    const quote = quotePrice(dto.categoryDistance, dto.selectedAddons ?? [], dto.couponCode);
    if (!quote) throw new BadRequestException('Invalid race category selected.');

    const parsedDob = new Date(dto.dateOfBirth);
    if (isNaN(parsedDob.getTime())) throw new BadRequestException('Invalid date of birth');

    const ageOnRaceDay = this.calculateAge(parsedDob);
    if (ageOnRaceDay < quote.category.minAge) {
      throw new BadRequestException(
        `Participants for ${quote.category.distance} must be at least ${quote.category.minAge} years old on race day.`,
      );
    }
    if (!dto.waiverAgreed) throw new BadRequestException('You must accept the event waiver to register.');

    // Registration numbers are random; retry on the (rare) clash.
    for (let attempt = 0; attempt < 5; attempt++) {
      const registrationNumber = this.generateRegistrationNumber(quote.category.distance);
      try {
        const record = await this.prisma.$transaction(async (tx) => {
          const created = await tx.runnerRegistration.create({
            data: {
              userId,
              registrationNumber,
              distance: quote.category.distance,
              raceTitle: quote.category.title,
              baseFee: quote.category.fee,
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
              selectedAddons: quote.addons.map((a) => ({ id: a.id, title: a.title, price: a.price })),
              grossAmount: quote.gross,
              discountAmount: quote.discount,
              netAmount: quote.net,
              couponCode: quote.coupon,
              waiverAgreed: true,
              // Payments are not live yet: registrations are confirmed straight away before launch.
              paymentStatus: 'CONFIRMED',
            },
          });
          await tx.user.update({ where: { id: userId }, data: { role: Role.RUNNER, status: 'ACTIVE' } });
          return created;
        });

        this.logger.log(`Runner registered: ${record.registrationNumber} (${record.email})`);
        return {
          success: true,
          registrationNumber: record.registrationNumber,
          runnerName: `${record.firstName} ${record.lastName}`,
          bibName: record.bibName,
          distance: record.distance,
          raceTitle: record.raceTitle,
          email: record.email,
          paymentStatus: record.paymentStatus,
          qrToken: record.qrCodeToken,
          createdAt: record.createdAt,
        };
      } catch (error) {
        const clash = error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';
        if (!clash) throw error;
        const target = JSON.stringify(error.meta?.target ?? '');
        if (!target.includes('registration_number')) {
          // Unique clash on user_id: a registration was saved in the meantime.
          throw new BadRequestException('You have already submitted this registration.');
        }
      }
    }
    throw new BadRequestException('We could not generate a registration number. Please try again.');
  }

  /** A registration can be read by its owner or by staff. */
  async getRegistrationByNumber(registrationNumber: string, requester: { id: string; role: Role | null }) {
    const record = await this.prisma.runnerRegistration.findUnique({ where: { registrationNumber } });
    if (!record) throw new NotFoundException('Registration not found');

    const isOwner = record.userId === requester.id;
    const isStaff = requester.role ? STAFF_ROLES.includes(requester.role) : false;
    if (!isOwner && !isStaff) throw new ForbiddenException('You do not have access to this registration.');
    return record;
  }

  async listRunners(limit = 50, offset = 0) {
    const [total, runners] = await Promise.all([
      this.prisma.runnerRegistration.count(),
      this.prisma.runnerRegistration.findMany({ take: limit, skip: offset, orderBy: { createdAt: 'desc' } }),
    ]);
    return { total, count: runners.length, runners };
  }
}
