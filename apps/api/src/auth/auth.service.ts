import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async register(email: string, haslo: string) {
    const istnieje = await this.prisma.uzytkownik.findUnique({
      where: { email },
    });
    if (istnieje) {
      throw new BadRequestException('Użytkownik o takim e-mailu już istnieje.');
    }
    const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS ?? 12);
    const hasloHash = await bcrypt.hash(haslo, saltRounds);
    const user = await this.prisma.uzytkownik.create({
      data: {
        email,
        hasloHash,
        rola: 'USER',
        subskrypcja: { create: { plan: 'FREE', status: 'BRAK' } },
      },
    });
    return this.signTokens(user.id, user.email, user.rola);
  }

  async login(email: string, haslo: string) {
    const user = await this.prisma.uzytkownik.findUnique({
      where: { email },
    });
    if (!user) {
      throw new UnauthorizedException('Nieprawidłowy e-mail lub hasło.');
    }
    if (user.zablokowany) {
      throw new ForbiddenException('Konto jest zablokowane.');
    }
    const ok = await bcrypt.compare(haslo, user.hasloHash);
    if (!ok) {
      throw new UnauthorizedException('Nieprawidłowy e-mail lub hasło.');
    }
    return this.signTokens(user.id, user.email, user.rola);
  }

  async signTokens(userId: string, email: string, rola: string) {
    const access = await this.jwt.signAsync(
      { sub: userId, email, rola },
      {
        secret: process.env.JWT_ACCESS_SECRET,
        expiresIn: process.env.JWT_ACCESS_EXPIRES ?? '15m',
      },
    );
    const refresh = await this.jwt.signAsync(
      { sub: userId, email, rola },
      {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: process.env.JWT_REFRESH_EXPIRES ?? '7d',
      },
    );
    return { accessToken: access, refreshToken: refresh };
  }

  async refresh(userId: string, email: string, rola: string) {
    return this.signTokens(userId, email, rola);
  }
}


