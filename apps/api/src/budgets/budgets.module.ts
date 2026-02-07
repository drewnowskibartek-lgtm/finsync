import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { BudgetsService } from './budgets.service';
import { BudgetsController } from './budgets.controller';

@Module({
  imports: [PrismaModule],
  providers: [BudgetsService],
  controllers: [BudgetsController],
})
export class BudgetsModule {}
