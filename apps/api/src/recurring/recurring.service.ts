import { Injectable, NotFoundException } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRecurringDto } from './dto/create-recurring.dto';
import { UpdateRecurringDto } from './dto/update-recurring.dto';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class RecurringService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  async list(userId: string) {
    return this.prisma.recurring.findMany({
      where: { userId },
      orderBy: { nastepnaData: 'asc' },
    });
  }

  async create(userId: string, dto: CreateRecurringDto) {
    return this.prisma.recurring.create({
      data: {
        userId,
        kwota: dto.kwota as any,
        kategoriaId: dto.kategoriaId,
        odbiorca: dto.odbiorca,
        metoda: dto.metoda,
        notatka: dto.notatka,
        czestotliwosc: dto.czestotliwosc,
        nastepnaData: new Date(dto.nastepnaData),
      },
    });
  }

  async update(userId: string, id: string, dto: UpdateRecurringDto) {
    const existing = await this.prisma.recurring.findFirst({
      where: { id, userId },
    });
    if (!existing) {
      throw new NotFoundException('Nie znaleziono cyklicznej transakcji.');
    }
    const updated = await this.prisma.recurring.update({
      where: { id },
      data: {
        kwota: dto.kwota !== undefined ? (dto.kwota as any) : existing.kwota,
        kategoriaId: dto.kategoriaId ?? existing.kategoriaId,
        odbiorca: dto.odbiorca ?? existing.odbiorca,
        metoda: dto.metoda ?? existing.metoda,
        notatka: dto.notatka ?? existing.notatka,
        czestotliwosc: dto.czestotliwosc ?? existing.czestotliwosc,
        nastepnaData: dto.nastepnaData
          ? new Date(dto.nastepnaData)
          : existing.nastepnaData,
        aktywna: dto.aktywna ?? existing.aktywna,
      },
    });
    await this.audit.logAutoIfPro(userId, 'Edytowano cykliczną transakcję', id);
    return updated;
  }

  async remove(userId: string, id: string) {
    const existing = await this.prisma.recurring.findFirst({
      where: { id, userId },
    });
    if (!existing) {
      throw new NotFoundException('Nie znaleziono cyklicznej transakcji.');
    }
    await this.prisma.recurring.delete({ where: { id } });
    await this.audit.logAutoIfPro(userId, 'Usunięto cykliczną transakcję', id);
    return { ok: true };
  }

  @Cron('0 2 * * *')
  async generujZRecurring() {
    const today = new Date();
    const doWykonania = await this.prisma.recurring.findMany({
      where: { aktywna: true, nastepnaData: { lte: today } },
    });

    for (const r of doWykonania) {
      await this.prisma.transakcja.create({
        data: {
          userId: r.userId,
          data: new Date(),
          kwota: r.kwota as any,
          waluta: 'PLN',
          odbiorca: r.odbiorca,
          kategoriaId: r.kategoriaId,
          metoda: r.metoda,
          notatka: r.notatka,
          utworzonoPrzez: r.userId,
        },
      });

      await this.audit.logAutoIfPro(r.userId, 'Recurring -> transakcja', r.id);

      const next = new Date(r.nastepnaData);
      switch (r.czestotliwosc) {
        case 'DZIENNA':
          next.setDate(next.getDate() + 1);
          break;
        case 'TYGODNIOWA':
          next.setDate(next.getDate() + 7);
          break;
        case 'MIESIECZNA':
          next.setMonth(next.getMonth() + 1);
          break;
        case 'ROCZNA':
          next.setFullYear(next.getFullYear() + 1);
          break;
      }
      await this.prisma.recurring.update({
        where: { id: r.id },
        data: { nastepnaData: next },
      });
    }
  }
}
