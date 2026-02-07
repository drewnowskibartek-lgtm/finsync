import { Body, Controller, ForbiddenException, Post } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';

@Controller()
export class SeedController {
  constructor(private readonly prisma: PrismaService) {}

  @Post('/seed')
  async seed(@Body() body: { token?: string }) {
    const requiredToken = process.env.SEED_TOKEN;
    if (!requiredToken || body?.token !== requiredToken) {
      throw new ForbiddenException('Brak dostępu do seeda.');
    }

    const already = await this.prisma.logSystemowy.findFirst({
      where: { wiadomosc: 'Seed wykonany.' },
    });
    if (already) {
      return { ok: true, message: 'Seed już był wykonany.' };
    }

    const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS ?? 12);
    const hasloHash = await bcrypt.hash('Haslo123!', saltRounds);

    const admin = await this.prisma.uzytkownik.upsert({
      where: { email: 'admin@finsync.local' },
      update: {},
      create: {
        email: 'admin@finsync.local',
        hasloHash,
        rola: 'ADMIN',
        subskrypcja: { create: { plan: 'PRO', status: 'AKTYWNA' } },
      },
    });

    const user = await this.prisma.uzytkownik.upsert({
      where: { email: 'user@finsync.local' },
      update: {},
      create: {
        email: 'user@finsync.local',
        hasloHash,
        rola: 'USER',
        subskrypcja: { create: { plan: 'PRO', status: 'AKTYWNA' } },
      },
    });

    await this.prisma.uzytkownik.upsert({
      where: { email: 'viewer@finsync.local' },
      update: {},
      create: {
        email: 'viewer@finsync.local',
        hasloHash,
        rola: 'VIEWER',
        subskrypcja: { create: { plan: 'FREE', status: 'BRAK' } },
      },
    });

    const globalCategories = [
      'Żywność',
      'Mieszkanie',
      'Transport',
      'Zdrowie',
      'Rozrywka',
      'Wynagrodzenie',
      'Oszczędności',
    ];
    for (const name of globalCategories) {
      await this.prisma.kategoria.upsert({
        where: { id: `${name}-global` },
        update: {},
        create: { id: `${name}-global`, nazwa: name, globalna: true },
      });
    }

    const salaryCategory = await this.prisma.kategoria.findUnique({
      where: { id: 'Wynagrodzenie-global' },
    });

    const userCategory = await this.prisma.kategoria.upsert({
      where: { id: 'user-edu' },
      update: {},
      create: {
        id: 'user-edu',
        nazwa: 'Edukacja',
        globalna: false,
        userId: user.id,
      },
    });

    await this.prisma.budzet.create({
      data: {
        userId: user.id,
        kategoriaId: userCategory.id,
        rok: new Date().getFullYear(),
        miesiac: new Date().getMonth() + 1,
        kwota: new Prisma.Decimal(1200),
      },
    });

    await this.prisma.recurring.create({
      data: {
        userId: user.id,
        kwota: new Prisma.Decimal(250),
        kategoriaId: userCategory.id,
        odbiorca: 'Subskrypcja kursu',
        metoda: 'karta',
        notatka: 'Miesięczna subskrypcja',
        czestotliwosc: 'MIESIECZNA',
        nastepnaData: new Date(),
      },
    });

    await this.prisma.transakcja.createMany({
      data: [
        {
          userId: user.id,
          data: new Date(),
          kwota: new Prisma.Decimal(-120.5),
          waluta: 'PLN',
          odbiorca: 'Sklep spożywczy',
          kategoriaId: userCategory.id,
          utworzonoPrzez: user.id,
          czyUzgodnione: true,
        },
        {
          userId: user.id,
          data: new Date(),
          kwota: new Prisma.Decimal(3500),
          waluta: 'PLN',
          odbiorca: 'Wynagrodzenie',
          kategoriaId: salaryCategory?.id,
          utworzonoPrzez: user.id,
        },
      ],
    });

    await this.prisma.planKonfiguracja.upsert({
      where: { plan: 'PRO' },
      update: { stripePriceId: process.env.STRIPE_PRICE_ID_PRO ?? 'price_xxx' },
      create: {
        plan: 'PRO',
        stripePriceId: process.env.STRIPE_PRICE_ID_PRO ?? 'price_xxx',
      },
    });

    await this.prisma.planKonfiguracja.upsert({
      where: { plan: 'FREE' },
      update: { stripePriceId: process.env.STRIPE_PRICE_ID_FREE ?? 'price_free' },
      create: {
        plan: 'FREE',
        stripePriceId: process.env.STRIPE_PRICE_ID_FREE ?? 'price_free',
      },
    });

    await this.prisma.logSystemowy.create({
      data: { poziom: 'INFO', wiadomosc: 'Seed wykonany.' },
    });

    return { ok: true, admin: admin.email, user: user.email };
  }
}
