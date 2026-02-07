import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { BudgetsService } from './budgets.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { ApiOperation } from '@nestjs/swagger';

@ApiTags('budgets')
@ApiBearerAuth()
@Controller('budgets')
@UseGuards(JwtAuthGuard)
export class BudgetsController {
  constructor(private budgets: BudgetsService) {}

  @Get()
  @ApiOperation({ summary: 'Lista budżetów' })
  async list(@CurrentUser() user: { userId: string }) {
    return this.budgets.list(user.userId);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'USER')
  @ApiOperation({ summary: 'Utwórz budżet' })
  async create(
    @CurrentUser() user: { userId: string },
    @Body() dto: CreateBudgetDto,
  ) {
    return this.budgets.create(user.userId, dto);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'USER')
  @ApiOperation({ summary: 'Edytuj budżet' })
  async update(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
    @Body() dto: UpdateBudgetDto,
  ) {
    return this.budgets.update(user.userId, id, dto);
  }
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'USER')
  @ApiOperation({ summary: 'Usuń budżet' })
  async remove(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
  ) {
    return this.budgets.remove(user.userId, id);
  }
}



