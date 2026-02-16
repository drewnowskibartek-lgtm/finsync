import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSavingsTransferDto } from './dto/create-transfer.dto';
import { CreateSavingsGoalDto } from './dto/create-goal.dto';
import { UpdateSavingsGoalDto } from './dto/update-goal.dto';
import { SavingsGoalMovementDto } from './dto/goal-movement.dto';
import { CloseSavingsGoalDto } from './dto/close-goal.dto';

@Injectable()
export class SavingsService {
  constructor(private prisma: PrismaService) {}

  private toNumber(value: unknown) {
    return Number(value ?? 0);
  }

  private async getUserCurrency(userId: string) {
    const user = await this.prisma.uzytkownik.findUnique({
      where: { id: userId },
      select: { walutaGlowna: true },
    });
    return user?.walutaGlowna ?? 'PLN';
  }

  private async sumTransfers(
    userId: string,
    waluta: string,
    typ: 'DO_OSZCZEDNOSCI' | 'DO_BUDZETU',
    range?: { start: Date; end: Date; inclusive: boolean },
  ) {
    const where: any = { userId, waluta, typ };
    if (range) {
      where.data = range.inclusive
        ? { gte: range.start, lte: range.end }
        : { gte: range.start, lt: range.end };
    }
    const sum = await this.prisma.oszczednosciTransfer.aggregate({
      where,
      _sum: { kwota: true },
    });
    return this.toNumber(sum._sum.kwota);
  }

  private async sumGoalMovements(
    userId: string,
    waluta: string,
    typ: 'WPLATA' | 'WYPLATA',
    range?: { start: Date; end: Date; inclusive: boolean },
  ) {
    const where: any = {
      typ,
      cel: { userId, waluta },
    };
    if (range) {
      where.data = range.inclusive
        ? { gte: range.start, lte: range.end }
        : { gte: range.start, lt: range.end };
    }
    const sum = await this.prisma.oszczednosciCelRuch.aggregate({
      where,
      _sum: { kwota: true },
    });
    return this.toNumber(sum._sum.kwota);
  }

  private async getBudgetBalance(userId: string, waluta: string) {
    const txSum = await this.prisma.transakcja.aggregate({
      where: { userId, waluta },
      _sum: { kwota: true },
    });
    const toSavings = await this.sumTransfers(userId, waluta, 'DO_OSZCZEDNOSCI');
    const toBudget = await this.sumTransfers(userId, waluta, 'DO_BUDZETU');
    return this.toNumber(txSum._sum.kwota) + toBudget - toSavings;
  }

  private async getSavingsBalance(userId: string, waluta: string) {
    const toSavings = await this.sumTransfers(userId, waluta, 'DO_OSZCZEDNOSCI');
    const toBudget = await this.sumTransfers(userId, waluta, 'DO_BUDZETU');
    let saldo = toSavings - toBudget;

    const mainCurrency = await this.getUserCurrency(userId);
    if (waluta === mainCurrency) {
      const deposits = await this.sumGoalMovements(userId, waluta, 'WPLATA');
      const withdrawals = await this.sumGoalMovements(userId, waluta, 'WYPLATA');
      saldo = saldo - deposits + withdrawals;
    }

    return saldo;
  }

  async summary(userId: string) {
    const walutaGlowna = await this.getUserCurrency(userId);
    const transfers = await this.prisma.oszczednosciTransfer.findMany({
      where: { userId },
      select: { waluta: true, kwota: true, typ: true },
    });
    const currencies = new Set<string>([walutaGlowna]);
    transfers.forEach((t) => currencies.add(t.waluta));

    const saldoWaluty = [] as { waluta: string; saldo: number }[];
    for (const waluta of currencies) {
      const saldo = await this.getSavingsBalance(userId, waluta);
      saldoWaluty.push({ waluta, saldo });
    }

    const cele = await this.prisma.oszczednosciCel.findMany({
      where: { userId, waluta: walutaGlowna, status: 'AKTYWNY' },
      orderBy: { utworzono: 'desc' },
    });

    return {
      walutaGlowna,
      saldo: saldoWaluty.find((s) => s.waluta === walutaGlowna)?.saldo ?? 0,
      saldoWaluty,
      cele: cele.map((c) => ({
        id: c.id,
        nazwa: c.nazwa,
        kwotaDocelowa: this.toNumber(c.kwotaDocelowa),
        kwotaZebrana: this.toNumber(c.kwotaZebrana),
        status: c.status,
        procent:
          this.toNumber(c.kwotaDocelowa) > 0
            ? Math.round(
                (this.toNumber(c.kwotaZebrana) /
                  this.toNumber(c.kwotaDocelowa)) *
                  100,
              )
            : 0,
      })),
    };
  }

  async listTransfers(userId: string, waluta?: string) {
    return this.prisma.oszczednosciTransfer.findMany({
      where: { userId, ...(waluta ? { waluta } : {}) },
      orderBy: { data: 'desc' },
    });
  }

  async createTransfer(userId: string, dto: CreateSavingsTransferDto) {
    const kwota = Number(dto.kwota);
    if (!Number.isFinite(kwota) || kwota <= 0) {
      throw new BadRequestException('Kwota musi być dodatnia.');
    }
    const waluta = (dto.waluta ?? 'PLN').toUpperCase();

    if (dto.typ === 'DO_OSZCZEDNOSCI') {
      const budzet = await this.getBudgetBalance(userId, waluta);
      if (budzet < kwota) {
        throw new BadRequestException('Brak środków w budżecie.');
      }
    }
    if (dto.typ === 'DO_BUDZETU') {
      const saldo = await this.getSavingsBalance(userId, waluta);
      if (saldo < kwota) {
        throw new BadRequestException('Brak środków w oszczędnościach.');
      }
    }

    return this.prisma.oszczednosciTransfer.create({
      data: {
        userId,
        typ: dto.typ,
        kwota: kwota as any,
        waluta,
        data: dto.data ? new Date(dto.data) : new Date(),
        notatka: dto.notatka,
      },
    });
  }

  async listGoals(userId: string) {
    return this.prisma.oszczednosciCel.findMany({
      where: { userId },
      orderBy: { utworzono: 'desc' },
    });
  }

  async createGoal(userId: string, dto: CreateSavingsGoalDto) {
    const waluta = await this.getUserCurrency(userId);
    const kwotaDocelowa = Number(dto.kwotaDocelowa);
    if (!Number.isFinite(kwotaDocelowa) || kwotaDocelowa <= 0) {
      throw new BadRequestException('Kwota docelowa musi być dodatnia.');
    }
    return this.prisma.oszczednosciCel.create({
      data: {
        userId,
        nazwa: dto.nazwa,
        kwotaDocelowa: kwotaDocelowa as any,
        waluta,
      },
    });
  }

  async updateGoal(userId: string, id: string, dto: UpdateSavingsGoalDto) {
    const existing = await this.prisma.oszczednosciCel.findFirst({
      where: { id, userId },
    });
    if (!existing) {
      throw new NotFoundException('Nie znaleziono celu oszczędnościowego.');
    }

    const data: any = {};
    if (dto.nazwa) data.nazwa = dto.nazwa;
    if (dto.kwotaDocelowa !== undefined) {
      const kwota = Number(dto.kwotaDocelowa);
      if (!Number.isFinite(kwota) || kwota <= 0) {
        throw new BadRequestException('Kwota docelowa musi być dodatnia.');
      }
      data.kwotaDocelowa = kwota as any;
    }

    return this.prisma.oszczednosciCel.update({
      where: { id },
      data,
    });
  }

  async depositToGoal(userId: string, id: string, dto: SavingsGoalMovementDto) {
    const kwota = Number(dto.kwota);
    if (!Number.isFinite(kwota) || kwota <= 0) {
      throw new BadRequestException('Kwota musi być dodatnia.');
    }

    const cel = await this.prisma.oszczednosciCel.findFirst({
      where: { id, userId },
    });
    if (!cel) throw new NotFoundException('Nie znaleziono celu.');
    if (cel.status !== 'AKTYWNY') {
      throw new BadRequestException('Cel jest zamknięty.');
    }

    const saldo = await this.getSavingsBalance(userId, cel.waluta);
    if (saldo < kwota) {
      throw new BadRequestException('Brak środków w oszczędnościach.');
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.oszczednosciCelRuch.create({
        data: {
          celId: cel.id,
          typ: 'WPLATA',
          kwota: kwota as any,
          notatka: dto.notatka,
        },
      });

      return tx.oszczednosciCel.update({
        where: { id: cel.id },
        data: {
          kwotaZebrana: { increment: kwota as any },
        },
      });
    });
  }

  async withdrawFromGoal(userId: string, id: string, dto: SavingsGoalMovementDto) {
    const kwota = Number(dto.kwota);
    if (!Number.isFinite(kwota) || kwota <= 0) {
      throw new BadRequestException('Kwota musi być dodatnia.');
    }

    const cel = await this.prisma.oszczednosciCel.findFirst({
      where: { id, userId },
    });
    if (!cel) throw new NotFoundException('Nie znaleziono celu.');

    const zebrane = this.toNumber(cel.kwotaZebrana);
    if (zebrane < kwota) {
      throw new BadRequestException('Kwota przekracza zebrane środki.');
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.oszczednosciCelRuch.create({
        data: {
          celId: cel.id,
          typ: 'WYPLATA',
          kwota: kwota as any,
          notatka: dto.notatka,
        },
      });

      return tx.oszczednosciCel.update({
        where: { id: cel.id },
        data: {
          kwotaZebrana: { decrement: kwota as any },
        },
      });
    });
  }

  async closeGoal(userId: string, id: string, dto: CloseSavingsGoalDto) {
    const cel = await this.prisma.oszczednosciCel.findFirst({
      where: { id, userId },
    });
    if (!cel) throw new NotFoundException('Nie znaleziono celu.');

    const doBudzetu = dto.doBudzetu !== false;
    const remaining = this.toNumber(cel.kwotaZebrana);

    return this.prisma.$transaction(async (tx) => {
      if (remaining > 0) {
        await tx.oszczednosciCelRuch.create({
          data: {
            celId: cel.id,
            typ: 'WYPLATA',
            kwota: remaining as any,
            notatka: 'Zamknięcie celu',
          },
        });
      }

      const updated = await tx.oszczednosciCel.update({
        where: { id: cel.id },
        data: {
          status: 'ZAMKNIETY',
          kwotaZebrana: 0 as any,
        },
      });

      if (remaining > 0 && doBudzetu) {
        await tx.oszczednosciTransfer.create({
          data: {
            userId,
            typ: 'DO_BUDZETU',
            kwota: remaining as any,
            waluta: cel.waluta,
            notatka: `Wypłata z celu: ${cel.nazwa}`,
          },
        });
      }

      return updated;
    });
  }
}
