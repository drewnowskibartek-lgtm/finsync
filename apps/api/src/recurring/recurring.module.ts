import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { RecurringService } from './recurring.service';
import { RecurringController } from './recurring.controller';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [PrismaModule, AuditModule],
  providers: [RecurringService],
  controllers: [RecurringController],
})
export class RecurringModule {}
