import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { SeedController } from './seed.controller';

@Module({
  imports: [PrismaModule],
  controllers: [SeedController],
})
export class SeedModule {}
