import { Body, Controller, ForbiddenException, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('register')
  @Throttle({ default: { limit: 5, ttl: 60 } })
  @ApiOperation({ summary: 'Rejestracja użytkownika' })
  async register(@Body() dto: RegisterDto) {
    if (process.env.DISABLE_SELF_REGISTER === 'true') {
      throw new ForbiddenException('Rejestracja jest wyłączona.');
    }
    return this.auth.register(dto.email, dto.haslo);
  }

  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60 } })
  @ApiOperation({ summary: 'Logowanie użytkownika' })
  async login(@Body() dto: LoginDto) {
    return this.auth.login(dto.email, dto.haslo);
  }
}
