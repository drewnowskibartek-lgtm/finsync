import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ReportsService } from './reports.service';
import { FeatureGate } from '../common/decorators/feature.decorator';
import { FeatureGuard } from '../common/guards/feature.guard';
import { ApiOperation } from '@nestjs/swagger';

@ApiTags('reports')
@ApiBearerAuth()
@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private reports: ReportsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Dashboard użytkownika' })
  @ApiQuery({ name: 'od', required: false, description: 'Data od (YYYY-MM-DD)' })
  @ApiQuery({ name: 'do', required: false, description: 'Data do (YYYY-MM-DD)' })
  async dashboard(
    @CurrentUser() user: { userId: string },
    @Query('od') od?: string,
    @Query('do') doDate?: string,
  ) {
    return this.reports.dashboard(user.userId, od, doDate);
  }

  @Get('advanced')
  @UseGuards(FeatureGuard)
  @FeatureGate('ADV_REPORTS')
  @ApiOperation({ summary: 'Zaawansowane raporty (Pro)' })
  @ApiQuery({ name: 'od', required: false, description: 'Data od (YYYY-MM-DD)' })
  @ApiQuery({ name: 'do', required: false, description: 'Data do (YYYY-MM-DD)' })
  async advanced(
    @CurrentUser() user: { userId: string },
    @Query('od') od?: string,
    @Query('do') doDate?: string,
  ) {
    return this.reports.advanced(user.userId, od, doDate);
  }
}
