import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuditService } from './audit.service';
import { ApiOperation } from '@nestjs/swagger';

@ApiTags('audit')
@ApiBearerAuth()
@Controller('audit')
@UseGuards(JwtAuthGuard)
export class AuditController {
  constructor(private audit: AuditService) {}

  @Get()
  @ApiOperation({ summary: 'Lista logów audytu użytkownika' })
  async list(@CurrentUser() user: { userId: string }) {
    return this.audit.list(user.userId);
  }
}


