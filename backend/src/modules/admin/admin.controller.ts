import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post, Query } from '@nestjs/common';
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

  @Get('users')
  @ApiOperation({ summary: 'List platform users with role, source, and status' })
  listUsers(@Query('limit') limit = 100) {
    return this.adminService.listUsers(Number(limit) || 100);
  }

  @Patch('users/:id/status')
  @ApiOperation({ summary: 'Suspend or reactivate a user account' })
  setUserStatus(@Param('id') id: string, @Body() body: { status: 'ACTIVE' | 'SUSPENDED' }) {
    return this.adminService.setUserStatus(id, body.status);
  }

  @Post('influencers/:id/review')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Approve or reject an influencer application' })
  reviewInfluencer(@Param('id') id: string, @Body() body: { decision: 'approve' | 'reject' }) {
    return this.adminService.reviewInfluencer(id, body.decision);
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
