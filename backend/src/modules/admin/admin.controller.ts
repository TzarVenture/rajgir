import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from '../../common/guards/roles.guard';
import { AdminService } from './admin.service';

@ApiTags('Admin')
@ApiBearerAuth()
@Roles(Role.ORGANIZER, Role.SUPER_ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Overall platform registration metrics (staff only)' })
  getOverview() {
    return this.adminService.getPlatformOverview();
  }

  @Get('quota-appeals')
  @ApiOperation({ summary: 'List all 50+ runner quota appeals from Teams, Corporates, and Schools' })
  listQuotaAppeals() {
    return this.adminService.listQuotaAppeals();
  }

  @Post('quota-appeals/:type/:id/review')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Approve or reject a 50+ runner quota appeal' })
  reviewQuotaAppeal(
    @Param('type') type: 'team' | 'corporate' | 'school',
    @Param('id') id: string,
    @Body() body: { decision: 'approve' | 'reject'; approvedQuota?: number },
  ) {
    return this.adminService.reviewQuotaAppeal(type, id, body.decision, body.approvedQuota);
  }

  @Get('applications')
  @ApiOperation({ summary: 'List all Group and Partner applications' })
  listApplications() {
    return this.adminService.listApplications();
  }

  @Post('applications/:type/:id/review')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Approve or reject a Group or Partner application' })
  reviewApplication(
    @Param('type') type: 'corporate' | 'school' | 'sponsor' | 'vendor' | 'tourism',
    @Param('id') id: string,
    @Body() body: { decision: 'approve' | 'reject' },
  ) {
    return this.adminService.reviewApplication(type, id, body.decision);
  }
}
