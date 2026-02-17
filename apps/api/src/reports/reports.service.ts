import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  private round2(value: number): number {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }

  private buildRange(od?: string, doDate?: string) {
    if (od || doDate) {
      if (!od || !doDate) {
        throw new BadRequestException('Podaj oba parametry: od i do.');
      }
      const start = new Date(od);
      const end = new Date(doDate);
      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        throw new BadRequestException('Nieprawidłowy zakres dat.');
      }
      if (start > end) {
        throw new BadRequestException('Data od nie może być po dacie do.');
      }
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      return { start, end, inclusive: true };
    }

    const start = new Date();
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setMonth(start.getMonth() + 1);
    return { start, end, inclusive: false };
  }

  private getMonthRange(date: Date) {
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }

  private async sumSavingsTransfers(
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
    return Number(sum._sum.kwota ?? 0);
  }

  private async sumSavingsGoalMovements(
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
    return Number(sum._sum.kwota ?? 0);
  }

  private async getSavingsSaldo(
    userId: string,
    waluta: string,
  ) {
    const toSavings = await this.sumSavingsTransfers(
      userId,
      waluta,
      'DO_OSZCZEDNOSCI',
    );
    const toBudget = await this.sumSavingsTransfers(
      userId,
      waluta,
      'DO_BUDZETU',
    );
    const deposits = await this.sumSavingsGoalMovements(
      userId,
      waluta,
      'WPLATA',
    );
    const withdrawals = await this.sumSavingsGoalMovements(
      userId,
      waluta,
      'WYPLATA',
    );
    return toSavings - toBudget - deposits + withdrawals;
  }

  private async getSavingsNetto(
    userId: string,
    waluta: string,
    range: { start: Date; end: Date; inclusive: boolean },
  ) {
    const toSavings = await this.sumSavingsTransfers(
      userId,
      waluta,
      'DO_OSZCZEDNOSCI',
      range,
    );
    const toBudget = await this.sumSavingsTransfers(
      userId,
      waluta,
      'DO_BUDZETU',
      range,
    );
    const deposits = await this.sumSavingsGoalMovements(
      userId,
      waluta,
      'WPLATA',
      range,
    );
    const withdrawals = await this.sumSavingsGoalMovements(
      userId,
      waluta,
      'WYPLATA',
      range,
    );
    return toSavings - toBudget - deposits + withdrawals;
  }


  async dashboard(userId: string, od?: string, doDate?: string) {
    const range = this.buildRange(od, doDate);
    const user = await this.prisma.uzytkownik.findUnique({
      where: { id: userId },
      select: { walutaGlowna: true },
    });
    const waluta = user?.walutaGlowna ?? 'PLN';

    const transactions = await this.prisma.transakcja.findMany({
      where: {
        userId,
        waluta,
        data: range.inclusive
          ? { gte: range.start, lte: range.end }
          : { gte: range.start, lt: range.end },
      },
      include: { kategoria: true },
    });

    const przychody = transactions
      .filter((t) => Number(t.kwota) > 0)
      .reduce((s, t) => s + Number(t.kwota), 0);
    const wydatki = transactions
      .filter((t) => Number(t.kwota) < 0)
      .reduce((s, t) => s + Math.abs(Number(t.kwota)), 0);
    const saldo = przychody - wydatki;
    const wskOszczednosci = przychody > 0 ? (saldo / przychody) * 100 : 0;

    const allTime = await this.prisma.transakcja.aggregate({
      where: { userId, waluta },
      _sum: { kwota: true },
    });
    const budzetLacznie = Number(allTime._sum.kwota ?? 0);

    const topMap = new Map<string, number>();
    for (const t of transactions) {
      const nazwa = t.kategoria?.nazwa ?? 'Bez kategorii';
      if (Number(t.kwota) < 0 && nazwa.toLowerCase() !== 'wynagrodzenie') {
        topMap.set(nazwa, (topMap.get(nazwa) ?? 0) + Math.abs(Number(t.kwota)));
      }
    }
    const top5 = Array.from(topMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([nazwa, suma]) => ({ nazwa, suma }));

    const trend = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const s = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const e = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const sum = await this.prisma.transakcja.aggregate({
        where: { userId, waluta, data: { gte: s, lt: e } },
        _sum: { kwota: true },
      });
      trend.push({
        miesiac: `${s.getFullYear()}-${String(s.getMonth() + 1).padStart(2, '0')}`,
        suma: Number(sum._sum.kwota ?? 0),
      });
    }

    const oszczednosciSaldo = await this.getSavingsSaldo(userId, waluta);
    const oszczednosciNetto = await this.getSavingsNetto(userId, waluta, range);
    const celeOszczednosci = await this.prisma.oszczednosciCel.findMany({
      where: { userId, waluta, status: 'AKTYWNY' },
      orderBy: { utworzono: 'desc' },
      take: 6,
    });

    return {
      przychody: this.round2(przychody),
      wydatki: this.round2(wydatki),
      saldo: this.round2(saldo),
      wskOszczednosci,
      budzetLacznie: this.round2(budzetLacznie),
      top5: top5.map((item) => ({ ...item, suma: this.round2(item.suma) })),
      trend: trend.map((item) => ({ ...item, suma: this.round2(item.suma) })),
      oszczednosciSaldo: this.round2(oszczednosciSaldo),
      oszczednosciNetto: this.round2(oszczednosciNetto),
      celeOszczednosci: celeOszczednosci.map((c) => ({
        id: c.id,
        nazwa: c.nazwa,
        kwotaDocelowa: this.round2(Number(c.kwotaDocelowa ?? 0)),
        kwotaZebrana: this.round2(Number(c.kwotaZebrana ?? 0)),
        status: c.status,
        procent:
          Number(c.kwotaDocelowa ?? 0) > 0
            ? Math.round(
                (Number(c.kwotaZebrana ?? 0) /
                  Number(c.kwotaDocelowa ?? 0)) *
                  100,
              )
            : 0,
      })),
    };
  }

  async advanced(userId: string, od?: string, doDate?: string) {
    const range = this.buildRange(od, doDate);

    const grouped = await this.prisma.transakcja.groupBy({
      by: ['kategoriaId'],
      where: {
        userId,
        data: range.inclusive
          ? { gte: range.start, lte: range.end }
          : { gte: range.start, lt: range.end },
      },
      _sum: { kwota: true },
    });

    const categories = await this.prisma.kategoria.findMany({
      where: { OR: [{ globalna: true }, { userId }] },
    });
    const catMap = new Map(categories.map((c) => [c.id, c.nazwa]));

    const kategorie = grouped
      .map((g) => ({
        kategoriaId: g.kategoriaId,
        nazwa: g.kategoriaId
          ? (catMap.get(g.kategoriaId) ?? 'Nieznana')
          : 'Bez kategorii',
        suma: this.round2(Number(g._sum.kwota ?? 0)),
      }))
      .filter((k) => k.suma < 0)
      .map((k) => ({ ...k, suma: this.round2(Math.abs(k.suma)) }));

    const budgets = await this.prisma.budzet.findMany({
      where: {
        userId,
        rok: range.start.getFullYear(),
        miesiac: range.start.getMonth() + 1,
      },
      include: { kategoria: true },
    });

    const wydanoMap = new Map<string, number>();
    for (const g of grouped) {
      if (g.kategoriaId) {
        const val = Number(g._sum.kwota ?? 0);
        if (val < 0) {
          wydanoMap.set(g.kategoriaId, Math.abs(val));
        }
      }
    }

    const prevMonth = new Date(range.start.getFullYear(), range.start.getMonth() - 1, 1);
    const prevRange = this.getMonthRange(prevMonth);
    const prevGrouped = await this.prisma.transakcja.groupBy({
      by: ['kategoriaId'],
      where: {
        userId,
        data: { gte: prevRange.start, lte: prevRange.end },
      },
      _sum: { kwota: true },
    });
    const prevSpentMap = new Map<string, number>();
    for (const g of prevGrouped) {
      if (g.kategoriaId) {
        const val = Number(g._sum.kwota ?? 0);
        if (val < 0) {
          prevSpentMap.set(g.kategoriaId, Math.abs(val));
        }
      }
    }
    const prevBudgets = await this.prisma.budzet.findMany({
      where: {
        userId,
        rok: prevMonth.getFullYear(),
        miesiac: prevMonth.getMonth() + 1,
      },
      include: { kategoria: true },
    });
    const prevBudgetMap = new Map<string, number>();
    for (const b of prevBudgets) {
      if (b.roluj) {
        prevBudgetMap.set(b.kategoriaId, Number(b.kwota));
      }
    }

    const budzety = budgets.map((b) => {
      const wydano = wydanoMap.get(b.kategoriaId) ?? 0;
      const limit = Number(b.kwota);
      const rollover = !!b.roluj;
      let carryOver = 0;
      if (rollover) {
        const prevLimit = prevBudgetMap.get(b.kategoriaId) ?? 0;
        const prevSpent = prevSpentMap.get(b.kategoriaId) ?? 0;
        carryOver = Math.max(0, prevLimit - prevSpent);
      }
      const available = limit + carryOver;
      const remaining = Math.max(0, available - wydano);
      const procent = available > 0 ? Math.round((wydano / available) * 100) : 0;
      return {
        id: b.id,
        kategoria: b.kategoria.nazwa,
        kwota: this.round2(limit),
        wydano: this.round2(wydano),
        procent,
        carryOver: this.round2(carryOver),
        available: this.round2(available),
        remaining: this.round2(remaining),
      };
    });

    return {
      kategorie,
      budzety,
    };
  }
}
