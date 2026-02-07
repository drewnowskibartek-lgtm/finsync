import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { AuditService } from '../audit/audit.service';
import { parse } from 'csv-parse/sync';
import { QueryTransactionsDto } from './dto/query-transactions.dto';

@Injectable()
export class TransactionsService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  async list(userId: string, query?: QueryTransactionsDto) {
    const where: any = { userId };
    if (
      query?.kwotaMin !== undefined &&
      query?.kwotaMax !== undefined &&
      query.kwotaMin > query.kwotaMax
    ) {
      throw new BadRequestException(
        'Kwota minimalna nie może być większa od maksymalnej.',
      );
    }
    if (query?.od || query?.do) {
      where.data = {};
      if (query.od) where.data.gte = new Date(query.od);
      if (query.do) where.data.lte = new Date(query.do);
    }
    if (query?.kategoriaId) {
      where.kategoriaId = query.kategoriaId;
    }
    if (query?.kwotaMin !== undefined || query?.kwotaMax !== undefined) {
      where.kwota = {};
      if (query.kwotaMin !== undefined) where.kwota.gte = query.kwotaMin as any;
      if (query.kwotaMax !== undefined) where.kwota.lte = query.kwotaMax as any;
    }
    if (query?.szukaj) {
      where.OR = [
        { odbiorca: { contains: query.szukaj, mode: 'insensitive' } },
        { referencja: { contains: query.szukaj, mode: 'insensitive' } },
        { notatka: { contains: query.szukaj, mode: 'insensitive' } },
      ];
    }
    if (query?.waluta) {
      where.waluta = query.waluta;
    }
    if (query?.metoda) {
      where.metoda = query.metoda;
    }
    return this.prisma.transakcja.findMany({
      where,
      orderBy: { data: 'desc' },
      include: { kategoria: true },
    });
  }

  private async normalizeKwotaByCategory(
    userId: string,
    kwota: number,
    kategoriaId?: string,
  ) {
    if (!kategoriaId) {
      return kwota > 0 ? -Math.abs(kwota) : kwota;
    }
    const kat = await this.prisma.kategoria.findFirst({
      where: { id: kategoriaId, OR: [{ globalna: true }, { userId }] },
      select: { nazwa: true },
    });
    const isSalary = kat?.nazwa?.toLowerCase() === 'wynagrodzenie';
    if (isSalary) {
      return Math.abs(kwota);
    }
    return kwota > 0 ? -Math.abs(kwota) : kwota;
  }

  async create(userId: string, dto: CreateTransactionDto) {
    const normalizedKwota = await this.normalizeKwotaByCategory(
      userId,
      Number(dto.kwota),
      dto.kategoriaId,
    );

    const duplikat = await this.prisma.transakcja.findFirst({
      where: {
        userId,
        data: new Date(dto.data),
        kwota: normalizedKwota as any,
        odbiorca: dto.odbiorca,
      },
    });

    const transakcja = await this.prisma.transakcja.create({
      data: {
        userId,
        data: new Date(dto.data),
        kwota: normalizedKwota as any,
        waluta: dto.waluta ?? 'PLN',
        odbiorca: dto.odbiorca,
        referencja: dto.referencja,
        kategoriaId: dto.kategoriaId,
        metoda: dto.metoda,
        notatka: dto.notatka,
        utworzonoPrzez: userId,
        czyUzgodnione: dto.czyUzgodnione ?? false,
        flagaDuplikatu: !!duplikat,
      },
    });

    if (!transakcja) {
      throw new BadRequestException('Nie udało się utworzyć transakcji.');
    }
    await this.audit.logAutoIfPro(
      userId,
      'Utworzono transakcję',
      transakcja.id,
    );
    return transakcja;
  }

  async update(userId: string, id: string, dto: UpdateTransactionDto) {
    const existing = await this.prisma.transakcja.findFirst({
      where: { id, userId },
    });
    if (!existing) {
      throw new NotFoundException('Nie znaleziono transakcji.');
    }

    const nextData = dto.data ? new Date(dto.data) : existing.data;
    const nextOdbiorca = dto.odbiorca ?? existing.odbiorca;
    const nextKategoriaId = dto.kategoriaId ?? existing.kategoriaId ?? undefined;
    const nextKwotaRaw =
      dto.kwota !== undefined ? Number(dto.kwota) : Number(existing.kwota);

    const normalizedKwota = await this.normalizeKwotaByCategory(
      userId,
      nextKwotaRaw,
      nextKategoriaId,
    );

    const duplikat = await this.prisma.transakcja.findFirst({
      where: {
        userId,
        id: { not: id },
        data: nextData,
        kwota: normalizedKwota as any,
        odbiorca: nextOdbiorca,
      },
    });

    const updated = await this.prisma.transakcja.update({
      where: { id },
      data: {
        data: nextData,
        kwota: normalizedKwota as any,
        waluta: dto.waluta ?? existing.waluta ?? 'PLN',
        odbiorca: nextOdbiorca,
        referencja: dto.referencja ?? existing.referencja,
        kategoriaId: nextKategoriaId,
        metoda: dto.metoda ?? existing.metoda,
        notatka: dto.notatka ?? existing.notatka,
        czyUzgodnione: dto.czyUzgodnione ?? existing.czyUzgodnione ?? false,
        flagaDuplikatu: !!duplikat,
      },
      include: { kategoria: true },
    });

    await this.audit.logAutoIfPro(userId, 'Edytowano transakcję', id);
    return updated;
  }

  async remove(userId: string, id: string) {
    const existing = await this.prisma.transakcja.findFirst({
      where: { id, userId },
    });
    if (!existing) {
      throw new NotFoundException('Nie znaleziono transakcji.');
    }
    await this.prisma.transakcja.delete({ where: { id } });
    await this.audit.logAutoIfPro(userId, 'Usunięto transakcję', id);
    return { ok: true };
  }

  private parseKwota(raw: string): number | null {
    if (!raw) return null;
    const normalized = raw.replace(/\s/g, '').replace(',', '.');
    const num = Number(normalized);
    return Number.isNaN(num) ? null : num;
  }

  async importCsv(userId: string, content: string) {
    const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length === 0) {
      throw new BadRequestException('Plik CSV jest pusty.');
    }
    const firstLine = lines[0];
    const delimiter =
      firstLine.includes(';') && !firstLine.includes(',') ? ';' : ',';

    const records = parse(content, {
      columns: true,
      skip_empty_lines: true,
      delimiter,
      trim: true,
    }) as Record<string, string>[];

    let dodane = 0;
    let duplikaty = 0;
    const bledy: { wiersz: number; blad: string }[] = [];

    for (let i = 0; i < records.length; i++) {
      const row = records[i];
      const data = row['data'] ?? row['Data'] ?? row['DATA'];
      const kwotaRaw = row['kwota'] ?? row['Kwota'] ?? row['KWOTA'];
      const waluta = row['waluta'] ?? row['Waluta'] ?? 'PLN';
      const odbiorca = row['odbiorca'] ?? row['Odbiorca'] ?? row['Kontrahent'];
      const referencja = row['referencja'] ?? row['Referencja'];
      const kategoriaNazwa = row['kategoria'] ?? row['Kategoria'];
      const metoda = row['metoda'] ?? row['Metoda'];
      const notatka = row['notatka'] ?? row['Notatka'];

      if (!data || !kwotaRaw || !odbiorca) {
        bledy.push({ wiersz: i + 2, blad: 'Brak wymaganych pól.' });
        continue;
      }
      const kwota = this.parseKwota(String(kwotaRaw));
      if (kwota === null) {
        bledy.push({ wiersz: i + 2, blad: 'Nieprawidłowa kwota.' });
        continue;
      }

      const dataObj = new Date(data);
      if (Number.isNaN(dataObj.getTime())) {
        bledy.push({ wiersz: i + 2, blad: 'Nieprawidłowa data.' });
        continue;
      }

      let kategoriaId: string | undefined = undefined;
      let kategoriaNazwaResolved: string | undefined = undefined;
      if (kategoriaNazwa) {
        const kat = await this.prisma.kategoria.findFirst({
          where: {
            nazwa: String(kategoriaNazwa),
            OR: [{ globalna: true }, { userId }],
          },
        });
        if (kat) {
          kategoriaId = kat.id;
          kategoriaNazwaResolved = kat.nazwa;
        } else {
          bledy.push({ wiersz: i + 2, blad: 'Nie znaleziono kategorii.' });
          continue;
        }
      }

      const duplikat = await this.prisma.transakcja.findFirst({
        where: {
          userId,
          data: dataObj,
          kwota: kwota as any,
          odbiorca: String(odbiorca),
        },
      });
      if (duplikat) {
        duplikaty++;
        continue;
      }

      const normalizedKwota =
        kategoriaNazwaResolved?.toLowerCase() === 'wynagrodzenie'
          ? Math.abs(kwota)
          : kwota > 0
            ? -Math.abs(kwota)
            : kwota;

      await this.prisma.transakcja.create({
        data: {
          userId,
          data: dataObj,
          kwota: normalizedKwota as any,
          waluta: String(waluta ?? 'PLN'),
          odbiorca: String(odbiorca),
          referencja: referencja ? String(referencja) : undefined,
          kategoriaId,
          metoda: metoda ? String(metoda) : undefined,
          notatka: notatka ? String(notatka) : undefined,
          utworzonoPrzez: userId,
          flagaDuplikatu: false,
        },
      });
      dodane++;
    }

    await this.audit.logAutoIfPro(userId, 'Import CSV transakcji');

    return { dodane, duplikaty, bledy };
  }

  async exportCsv(userId: string) {
    const rows = await this.prisma.transakcja.findMany({
      where: { userId },
      orderBy: { data: 'desc' },
      include: { kategoria: true },
    });

    const header = [
      'data',
      'kwota',
      'waluta',
      'odbiorca',
      'referencja',
      'kategoria',
      'metoda',
      'notatka',
    ];
    const lines = [header.join(',')];
    for (const t of rows) {
      const line = [
        t.data.toISOString().slice(0, 10),
        Number(t.kwota).toString(),
        t.waluta ?? 'PLN',
        `"${(t.odbiorca ?? '').replace(/\"/g, '""')}"`,
        `"${(t.referencja ?? '').replace(/\"/g, '""')}"`,
        `"${(t.kategoria?.nazwa ?? '').replace(/\"/g, '""')}"`,
        `"${(t.metoda ?? '').replace(/\"/g, '""')}"`,
        `"${(t.notatka ?? '').replace(/\"/g, '""')}"`,
      ];
      lines.push(line.join(','));
    }
    return lines.join('\n');
  }

  async exportRows(userId: string) {
    const rows = await this.prisma.transakcja.findMany({
      where: { userId },
      orderBy: { data: 'desc' },
      include: { kategoria: true },
    });
    return rows.map((t) => ({
      data: t.data.toISOString().slice(0, 10),
      kwota: Number(t.kwota),
      waluta: t.waluta ?? 'PLN',
      odbiorca: t.odbiorca ?? '',
      referencja: t.referencja ?? '',
      kategoria: t.kategoria?.nazwa ?? '',
      metoda: t.metoda ?? '',
      notatka: t.notatka ?? '',
    }));
  }
}




