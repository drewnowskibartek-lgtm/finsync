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
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { SavingsService } from './savings.service';
import { CreateSavingsTransferDto } from './dto/create-transfer.dto';
import { CreateSavingsGoalDto } from './dto/create-goal.dto';
import { UpdateSavingsGoalDto } from './dto/update-goal.dto';
import { SavingsGoalMovementDto } from './dto/goal-movement.dto';
import { CloseSavingsGoalDto } from './dto/close-goal.dto';

@ApiTags('savings')
@ApiBearerAuth()
@Controller('savings')
@UseGuards(JwtAuthGuard)
export class SavingsController {
  constructor(private savings: SavingsService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Podsumowanie oszczędności' })
  async summary(@CurrentUser() user: { userId: string }) {
    return this.savings.summary(user.userId);
  }

  @Get('transfers')
  @ApiOperation({ summary: 'Lista transferów oszczędności' })
  async listTransfers(
    @CurrentUser() user: { userId: string },
    @Query('waluta') waluta?: string,
  ) {
    return this.savings.listTransfers(user.userId, waluta);
  }

  @Post('transfers')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'USER')
  @ApiOperation({ summary: 'Utwórz transfer oszczędności' })
  async createTransfer(
    @CurrentUser() user: { userId: string },
    @Body() dto: CreateSavingsTransferDto,
  ) {
    return this.savings.createTransfer(user.userId, dto);
  }

  @Get('goals')
  @ApiOperation({ summary: 'Lista celów oszczędnościowych' })
  async listGoals(@CurrentUser() user: { userId: string }) {
    return this.savings.listGoals(user.userId);
  }

  @Post('goals')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'USER')
  @ApiOperation({ summary: 'Utwórz cel oszczędnościowy' })
  async createGoal(
    @CurrentUser() user: { userId: string },
    @Body() dto: CreateSavingsGoalDto,
  ) {
    return this.savings.createGoal(user.userId, dto);
  }

  @Patch('goals/:id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'USER')
  @ApiOperation({ summary: 'Edytuj cel oszczędnościowy' })
  async updateGoal(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
    @Body() dto: UpdateSavingsGoalDto,
  ) {
    return this.savings.updateGoal(user.userId, id, dto);
  }

  @Post('goals/:id/deposit')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'USER')
  @ApiOperation({ summary: 'Wpłata na cel oszczędnościowy' })
  async depositGoal(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
    @Body() dto: SavingsGoalMovementDto,
  ) {
    return this.savings.depositToGoal(user.userId, id, dto);
  }

  @Post('goals/:id/withdraw')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'USER')
  @ApiOperation({ summary: 'Wypłata z celu oszczędnościowego' })
  async withdrawGoal(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
    @Body() dto: SavingsGoalMovementDto,
  ) {
    return this.savings.withdrawFromGoal(user.userId, id, dto);
  }

  @Post('goals/:id/close')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'USER')
  @ApiOperation({ summary: 'Zamknij cel oszczędnościowy' })
  async closeGoal(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
    @Body() dto: CloseSavingsGoalDto,
  ) {
    return this.savings.closeGoal(user.userId, id, dto);
  }
}
