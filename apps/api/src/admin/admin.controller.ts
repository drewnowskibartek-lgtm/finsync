import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { AdminService } from './admin.service';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { CreateGlobalCategoryDto } from './dto/create-global-category.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { QueryLogsDto } from './dto/query-logs.dto';
import { CreateAdminUserDto } from './dto/create-admin-user.dto';

@ApiTags('admin')
@ApiBearerAuth()
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminController {
  constructor(private admin: AdminService) {}

  @Get('users')
  @ApiOperation({ summary: 'Lista użytkowników (admin)' })
  async listUsers() {
    return this.admin.listUsers();
  }

  @Post('users')
  @ApiOperation({ summary: 'Utwórz użytkownika (admin)' })
  async createUser(@Body() dto: CreateAdminUserDto) {
    return this.admin.createUser(dto);
  }


  @Patch('users/:id/role')
  @ApiOperation({ summary: 'Zmiana roli użytkownika' })
  async setRole(@Param('id') id: string, @Body() dto: UpdateUserRoleDto) {
    return this.admin.setRole(id, dto.rola);
  }

  @Patch('users/:id/block')
  @ApiOperation({ summary: 'Blokada użytkownika' })
  async block(@Param('id') id: string) {
    return this.admin.setBlock(id, true);
  }

  @Patch('users/:id/unblock')
  @ApiOperation({ summary: 'Odblokowanie użytkownika' })
  async unblock(@Param('id') id: string) {
    return this.admin.setBlock(id, false);
  }

  @Get('categories')
  @ApiOperation({ summary: 'Lista kategorii globalnych' })
  async listGlobalCategories() {
    return this.admin.listGlobalCategories();
  }

  @Post('categories')
  @ApiOperation({ summary: 'Dodaj kategorię globalną' })
  async createGlobalCategory(@Body() body: CreateGlobalCategoryDto) {
    return this.admin.createGlobalCategory(body.nazwa);
  }

  @Post('categories/:id/delete')
  @ApiOperation({ summary: 'Usuń kategorię globalną' })
  async deleteGlobalCategory(@Param('id') id: string) {
    return this.admin.deleteGlobalCategory(id);
  }

  @Post('plans')
  @ApiOperation({ summary: 'Mapowanie planu do Stripe Price ID' })
  async upsertPlan(@Body() body: UpdatePlanDto) {
    return this.admin.upsertPlan(body.plan, body.stripePriceId);
  }

  @Get('logs')
  @ApiOperation({ summary: 'Logi systemowe' })
  @ApiQuery({ name: 'poziom', required: false })
  @ApiQuery({ name: 'zawiera', required: false })
  async logs(@Query() query: QueryLogsDto) {
    return this.admin.systemLogs(query);
  }

  @Get('subscriptions')
  @ApiOperation({ summary: 'Lista subskrypcji' })
  async listSubscriptions() {
    return this.admin.listSubscriptions();
  }
}


