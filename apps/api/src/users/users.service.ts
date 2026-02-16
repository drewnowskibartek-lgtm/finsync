import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.uzytkownik.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        rola: true,
        zablokowany: true,
        walutaGlowna: true,
        utworzono: true,
      },
    });
    if (!user) {
      throw new NotFoundException('Nie znaleziono użytkownika.');
    }
    return user;
  }

  async updateProfile(userId: string, walutaGlowna?: string) {
    const user = await this.prisma.uzytkownik.update({
      where: { id: userId },
      data: {
        ...(walutaGlowna ? { walutaGlowna } : {}),
      },
      select: {
        id: true,
        email: true,
        rola: true,
        zablokowany: true,
        walutaGlowna: true,
        utworzono: true,
      },
    });
    return user;
  }
}


