import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { SavingsController } from './savings.controller';
import { SavingsService } from './savings.service';

@Module({
  imports: [PrismaModule],
  providers: [SavingsService],
  controllers: [SavingsController],
})
export class SavingsModule {}
