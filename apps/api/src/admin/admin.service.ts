import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async listUsers() {
    return this.prisma.uzytkownik.findMany({
      select: {
        id: true,
        email: true,
        rola: true,
        zablokowany: true,
        utworzono: true,
      },
      orderBy: { utworzono: 'desc' },
    });
  }

  async createUser(input: {
    email: string;
    haslo: string;
    rola: 'ADMIN' | 'USER' | 'VIEWER';
    plan: 'FREE' | 'PRO';
    status?: 'AKTYWNA' | 'WSTRZYMANA' | 'ANULOWANA' | 'BRAK';
    zablokowany?: boolean;
  }) {
    const istnieje = await this.prisma.uzytkownik.findUnique({
      where: { email: input.email },
    });
    if (istnieje) {
      throw new BadRequestException('Użytkownik o takim e-mailu już istnieje.');
    }
    const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS ?? 12);
    const hasloHash = await bcrypt.hash(input.haslo, saltRounds);
    const status =
      input.status ?? (input.plan === 'PRO' ? 'AKTYWNA' : ('BRAK' as const));

    return this.prisma.uzytkownik.create({
      data: {
        email: input.email,
        hasloHash,
        rola: input.rola,
        zablokowany: input.zablokowany ?? false,
        subskrypcja: {
          create: {
            plan: input.plan,
            status,
          },
        },
      },
      select: {
        id: true,
        email: true,
        rola: true,
        zablokowany: true,
        utworzono: true,
      },
    });
  }

  async listSubscriptions() {
    return this.prisma.subskrypcja.findMany({
      include: { uzytkownik: { select: { id: true, email: true } } },
      orderBy: { zaktualizowano: 'desc' },
    });
  }

  async setRole(id: string, rola: 'ADMIN' | 'USER' | 'VIEWER') {
    const user = await this.prisma.uzytkownik.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Nie znaleziono użytkownika.');
    return this.prisma.uzytkownik.update({ where: { id }, data: { rola } });
  }

  async setBlock(id: string, zablokowany: boolean) {
    const user = await this.prisma.uzytkownik.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Nie znaleziono użytkownika.');
    return this.prisma.uzytkownik.update({
      where: { id },
      data: { zablokowany },
    });
  }

  async createGlobalCategory(nazwa: string) {
    return this.prisma.kategoria.create({
      data: { nazwa, globalna: true },
    });
  }

  async listGlobalCategories() {
    return this.prisma.kategoria.findMany({
      where: { globalna: true },
      orderBy: { nazwa: 'asc' },
    });
  }

  async deleteGlobalCategory(id: string) {
    return this.prisma.kategoria.delete({ where: { id } });
  }

  async upsertPlan(plan: 'FREE' | 'PRO', stripePriceId: string) {
    return this.prisma.planKonfiguracja.upsert({
      where: { plan },
      update: { stripePriceId, aktywny: true },
      create: { plan, stripePriceId, aktywny: true },
    });
  }

  async systemLogs(query?: { poziom?: string; zawiera?: string }) {
    return this.prisma.logSystemowy.findMany({
      where: {
        poziom: query?.poziom,
        wiadomosc: query?.zawiera
          ? { contains: query.zawiera, mode: 'insensitive' }
          : undefined,
      },
      orderBy: { utworzono: 'desc' },
      take: 200,
    });
  }

}


