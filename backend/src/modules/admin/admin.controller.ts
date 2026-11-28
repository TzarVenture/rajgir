import { BadRequestException, Body, Controller, Get, HttpCode, HttpStatus, Param, ParseEnumPipe, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { AuthContext, CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/guards/roles.guard';
import { AdminActor, AdminService } from './admin.service';
import {
  APPEAL_TYPES,
  APPLICATION_TYPES,
  AppealType,
  ApplicationType,
  CreateMediaDto,
  CreateNotificationDto,
  CreatePaymentDto,
  CreateSupportTicketDto,
  DecisionDto,
  ListQueryDto,
  MediaVisibilityDto,
  PaymentStatusDto,
  QuotaAppealDecisionDto,
  UpdateAdminPermissionsDto,
  UpdateSupportTicketDto,
  UpsertCmsBlockDto,
  UpsertEventCategoryDto,
  UpsertSettingDto,
  UserStatusDto,
} from './dto/admin.dto';

/** Validates `:type` path segments against a fixed list (400 otherwise). */
const typeOf = <T extends readonly string[]>(values: T) =>
  new ParseEnumPipe(Object.fromEntries(values.map((v) => [v, v])), { exceptionFactory: () => new BadRequestException('Unknown type.') });

/** Record ids are UUIDs; anything else is a 400 instead of a database error. */
const uuid = new ParseUUIDPipe();

function actorOf(auth: AuthContext): AdminActor {
  return { id: auth.dbUser.id, email: auth.dbUser.email, role: auth.dbUser.role ?? Role.ORGANIZER };
}

/**
 * Staff-only admin API. Authentication and the ORGANIZER / SUPER_ADMIN role check are applied by the
 * global guards; bodies are validated by the DTOs in ./dto/admin.dto.ts; ids must be UUIDs.
 */
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
  listUsers(@Query() query: ListQueryDto) {
    return this.adminService.listUsers(query.limit ?? 100);
  }

  @Patch('users/:id/status')
  @ApiOperation({ summary: 'Suspend or reactivate a user account' })
  setUserStatus(@CurrentUser() auth: AuthContext, @Param('id', uuid) id: string, @Body() body: UserStatusDto) {
    return this.adminService.setUserStatus(id, body.status, actorOf(auth));
  }

  @Post('influencers/:id/review')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Approve or reject an influencer application' })
  reviewInfluencer(@CurrentUser() auth: AuthContext, @Param('id', uuid) id: string, @Body() body: DecisionDto) {
    return this.adminService.reviewInfluencer(id, body.decision, actorOf(auth));
  }

  @Get('quota-appeals')
  @ApiOperation({ summary: 'List all 50+ runner quota appeals from Teams, Corporates, and Schools' })
  listQuotaAppeals() {
    return this.adminService.listQuotaAppeals();
  }

  @Post('quota-appeals/:type/:id/review')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'type', enum: APPEAL_TYPES })
  @ApiOperation({ summary: 'Approve or reject a 50+ runner quota appeal' })
  reviewQuotaAppeal(
    @CurrentUser() auth: AuthContext,
    @Param('type', typeOf(APPEAL_TYPES)) type: AppealType,
    @Param('id', uuid) id: string,
    @Body() body: QuotaAppealDecisionDto,
  ) {
    return this.adminService.reviewQuotaAppeal(type, id, body.decision, body.approvedQuota, actorOf(auth));
  }

  @Get('applications')
  @ApiOperation({ summary: 'List all Group and Partner applications' })
  listApplications() {
    return this.adminService.listApplications();
  }

  @Post('applications/:type/:id/review')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'type', enum: APPLICATION_TYPES })
  @ApiOperation({ summary: 'Approve or reject a Group or Partner application' })
  reviewApplication(
    @CurrentUser() auth: AuthContext,
    @Param('type', typeOf(APPLICATION_TYPES)) type: ApplicationType,
    @Param('id', uuid) id: string,
    @Body() body: DecisionDto,
  ) {
    return this.adminService.reviewApplication(type, id, body.decision, actorOf(auth));
  }

  @Get('events')
  @ApiOperation({ summary: 'List race categories and capacities' })
  listEvents() {
    return this.adminService.listEventCategories();
  }

  @Post('events')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Create or update a race category (matched by distance)' })
  upsertEvent(@CurrentUser() auth: AuthContext, @Body() body: UpsertEventCategoryDto) {
    return this.adminService.upsertEventCategory(body, actorOf(auth));
  }

  @Get('payments')
  @ApiOperation({ summary: 'List payment transactions' })
  listPayments(@Query() query: ListQueryDto) {
    return this.adminService.listPayments(query.limit ?? 100);
  }

  @Post('payments')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Record a payment transaction (manual ledger)' })
  createPayment(@CurrentUser() auth: AuthContext, @Body() body: CreatePaymentDto) {
    return this.adminService.createPayment(body, actorOf(auth));
  }

  @Patch('payments/:id/status')
  @ApiOperation({ summary: 'Update payment status (CAPTURED / PENDING / REFUNDED)' })
  updatePaymentStatus(@CurrentUser() auth: AuthContext, @Param('id', uuid) id: string, @Body() body: PaymentStatusDto) {
    return this.adminService.updatePaymentStatus(id, body.status, actorOf(auth));
  }

  @Get('media')
  @ApiOperation({ summary: 'List media assets' })
  listMedia() {
    return this.adminService.listMediaAssets();
  }

  @Post('media')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add a media asset' })
  createMedia(@CurrentUser() auth: AuthContext, @Body() body: CreateMediaDto) {
    return this.adminService.createMediaAsset(body, actorOf(auth));
  }

  @Patch('media/:id')
  @ApiOperation({ summary: 'Publish or unpublish a media asset' })
  toggleMedia(@CurrentUser() auth: AuthContext, @Param('id', uuid) id: string, @Body() body: MediaVisibilityDto) {
    return this.adminService.toggleMediaAsset(id, body.isPublished, actorOf(auth));
  }

  @Get('cms')
  @ApiOperation({ summary: 'List CMS content blocks' })
  listCms() {
    return this.adminService.listCmsBlocks();
  }

  @Post('cms')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Create or update a CMS block (matched by slug)' })
  upsertCms(@CurrentUser() auth: AuthContext, @Body() body: UpsertCmsBlockDto) {
    return this.adminService.upsertCmsBlock(body, actorOf(auth));
  }

  @Get('notifications')
  @ApiOperation({ summary: 'List notification campaigns' })
  listNotifications() {
    return this.adminService.listNotificationCampaigns();
  }

  @Post('notifications')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Record a notification campaign (no delivery service is connected)' })
  createNotification(@CurrentUser() auth: AuthContext, @Body() body: CreateNotificationDto) {
    return this.adminService.createNotificationCampaign(body, actorOf(auth));
  }

  @Get('support')
  @ApiOperation({ summary: 'List support tickets' })
  listSupport() {
    return this.adminService.listSupportTickets();
  }

  @Post('support')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a support ticket' })
  createSupport(@CurrentUser() auth: AuthContext, @Body() body: CreateSupportTicketDto) {
    return this.adminService.createSupportTicket(body, actorOf(auth));
  }

  @Patch('support/:id')
  @ApiOperation({ summary: 'Update support ticket status/assignment (only the fields sent)' })
  updateSupport(@CurrentUser() auth: AuthContext, @Param('id', uuid) id: string, @Body() body: UpdateSupportTicketDto) {
    return this.adminService.updateSupportTicket(id, body, actorOf(auth));
  }

  @Get('permissions')
  @ApiOperation({ summary: 'List admin profiles and their permission flags' })
  listPermissions() {
    return this.adminService.listAdminProfiles();
  }

  @Patch('permissions/:id')
  @ApiOperation({ summary: 'Update admin permission flags' })
  updatePermissions(@CurrentUser() auth: AuthContext, @Param('id', uuid) id: string, @Body() body: UpdateAdminPermissionsDto) {
    return this.adminService.updateAdminPermissions(id, body, actorOf(auth));
  }

  @Get('audit-logs')
  @ApiOperation({ summary: 'List admin audit logs' })
  listAuditLogs(@Query() query: ListQueryDto) {
    return this.adminService.listAuditLogs(query.limit ?? 100);
  }

  @Get('settings')
  @ApiOperation({ summary: 'List platform settings' })
  listSettings() {
    return this.adminService.listSettings();
  }

  @Post('settings')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Create or update a platform setting (matched by key)' })
  upsertSetting(@CurrentUser() auth: AuthContext, @Body() body: UpsertSettingDto) {
    return this.adminService.upsertSetting(body, actorOf(auth));
  }
}
