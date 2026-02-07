import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { FeatureGate } from '../common/decorators/feature.decorator';
import { FeatureGuard } from '../common/guards/feature.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreateRecurringDto } from './dto/create-recurring.dto';
import { UpdateRecurringDto } from './dto/update-recurring.dto';
import { RecurringService } from './recurring.service';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { ApiOperation } from '@nestjs/swagger';

@ApiTags('recurring')
@ApiBearerAuth()
@Controller('recurring')
@UseGuards(JwtAuthGuard, FeatureGuard)
@FeatureGate('RECURRENT')
export class RecurringController {
  constructor(private recurring: RecurringService) {}

  @Get()
  @ApiOperation({ summary: 'Lista cyklicznych transakcji (Pro)' })
  async list(@CurrentUser() user: { userId: string }) {
    return this.recurring.list(user.userId);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'USER')
  @ApiOperation({ summary: 'Dodaj cykliczną transakcję (Pro)' })
  async create(
    @CurrentUser() user: { userId: string },
    @Body() dto: CreateRecurringDto,
  ) {
    return this.recurring.create(user.userId, dto);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'USER')
  @ApiOperation({ summary: 'Edytuj cykliczną transakcję (Pro)' })
  async update(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
    @Body() dto: UpdateRecurringDto,
  ) {
    return this.recurring.update(user.userId, id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'USER')
  @ApiOperation({ summary: 'Usuń cykliczną transakcję (Pro)' })
  async remove(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
  ) {
    return this.recurring.remove(user.userId, id);
  }
}
