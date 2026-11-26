import { Body, Controller, Get, HttpCode, HttpStatus, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthContext, CurrentUser } from '../../common/decorators/current-user.decorator';
import {
  AddManagedRunnerDto,
  BulkAddManagedRunnersDto,
  SubmitQuotaAppealDto,
  UpdateGroupProfileDto,
  UpdatePartnerProfileDto,
} from './dto/group-ops.dto';
import { GroupOpsService } from './group-ops.service';

@ApiTags('Group & Partner Operations')
@ApiBearerAuth()
@Controller()
export class GroupOpsController {
  constructor(private readonly groupOps: GroupOpsService) {}

  @Get('groups/dashboard')
  @ApiOperation({ summary: 'Group dashboard: profile, 50-runner quota usage, appeal status, and roster' })
  getGroupDashboard(@CurrentUser() auth: AuthContext) {
    return this.groupOps.getGroupDashboard(auth.dbUser.id);
  }

  @Post('groups/runners')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add a single managed runner (manual entry, skips auth, enforces quota)' })
  addOneRunner(@CurrentUser() auth: AuthContext, @Body() dto: AddManagedRunnerDto) {
    return this.groupOps.addManagedRunners(auth.dbUser.id, [dto]);
  }

  @Post('groups/runners/bulk')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Bulk add managed runners from CSV/Excel (skips auth, enforces quota)' })
  addBulkRunners(@CurrentUser() auth: AuthContext, @Body() dto: BulkAddManagedRunnersDto) {
    return this.groupOps.addManagedRunners(auth.dbUser.id, dto.runners);
  }

  @Post('groups/quota-appeal')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Submit an appeal to Admin to raise the 50-runner quota' })
  submitQuotaAppeal(@CurrentUser() auth: AuthContext, @Body() dto: SubmitQuotaAppealDto) {
    return this.groupOps.submitQuotaAppeal(auth.dbUser.id, dto);
  }

  @Patch('groups/profile')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update Team, Corporate, or School profile & coordinator contact' })
  updateGroupProfile(@CurrentUser() auth: AuthContext, @Body() dto: UpdateGroupProfileDto) {
    return this.groupOps.updateGroupProfile(auth.dbUser.id, dto);
  }

  @Get('partners/dashboard')
  @ApiOperation({ summary: 'Partner dashboard: profile and status for Sponsor, Vendor, or Tourism' })
  getPartnerDashboard(@CurrentUser() auth: AuthContext) {
    return this.groupOps.getPartnerDashboard(auth.dbUser.id);
  }

  @Patch('partners/profile')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update Sponsor, Vendor, or Tourism profile & partner contact' })
  updatePartnerProfile(@CurrentUser() auth: AuthContext, @Body() dto: UpdatePartnerProfileDto) {
    return this.groupOps.updatePartnerProfile(auth.dbUser.id, dto);
  }
}
