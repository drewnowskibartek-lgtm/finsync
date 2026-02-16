import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private users: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Profil zalogowanego użytkownika' })
  async me(@CurrentUser() user: { userId: string }) {
    return this.users.getProfile(user.userId);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Aktualizacja profilu zalogowanego użytkownika' })
  async update(
    @CurrentUser() user: { userId: string },
    @Body() dto: UpdateUserDto,
  ) {
    return this.users.updateProfile(user.userId, dto.walutaGlowna);
  }
}
