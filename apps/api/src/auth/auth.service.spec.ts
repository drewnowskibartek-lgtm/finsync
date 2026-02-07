import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import {
  BadRequestException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';

describe('AuthService', () => {
  const prisma = {
    uzytkownik: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  } as unknown as PrismaService;

  const jwt = {
    signAsync: jest.fn().mockResolvedValue('token'),
  } as unknown as JwtService;

  const service = new AuthService(prisma, jwt);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('powinien odrzucić rejestrację gdy użytkownik istnieje', async () => {
    (prisma.uzytkownik.findUnique as jest.Mock).mockResolvedValue({ id: '1' });
    await expect(service.register('a@a.pl', 'haslo')).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('powinien odrzucić logowanie gdy konto zablokowane', async () => {
    (prisma.uzytkownik.findUnique as jest.Mock).mockResolvedValue({
      id: '1',
      email: 'a@a.pl',
      hasloHash: 'hash',
      rola: 'USER',
      zablokowany: true,
    });
    await expect(service.login('a@a.pl', 'haslo')).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('powinien odrzucić logowanie przy złym haśle', async () => {
    (prisma.uzytkownik.findUnique as jest.Mock).mockResolvedValue({
      id: '1',
      email: 'a@a.pl',
      hasloHash: 'hash',
      rola: 'USER',
      zablokowany: false,
    });
    jest.spyOn(bcrypt, 'compare').mockImplementation(async () => false);
    await expect(service.login('a@a.pl', 'haslo')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });
});


