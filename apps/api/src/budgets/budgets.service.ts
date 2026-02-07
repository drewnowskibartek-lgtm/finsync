import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';

@Injectable()
export class BudgetsService {
  constructor(private prisma: PrismaService) {}

  async list(userId: string) {
    return this.prisma.budzet.findMany({
      where: { userId },
      include: { kategoria: true },
      orderBy: [{ rok: 'desc' }, { miesiac: 'desc' }],
    });
  }

  async create(userId: string, dto: CreateBudgetDto) {
    return this.prisma.budzet.create({
      data: {
        userId,
        kategoriaId: dto.kategoriaId,
        rok: dto.rok,
        miesiac: dto.miesiac,
        kwota: dto.kwota as any,
        roluj: dto.roluj ?? false,
      },
    });
  }

  async update(userId: string, id: string, dto: UpdateBudgetDto) {
    const budget = await this.prisma.budzet.findFirst({
      where: { id, userId },
    });
    if (!budget) {
      throw new NotFoundException('Nie znaleziono budżetu.');
    }
    return this.prisma.budzet.update({
      where: { id },
      data: {
        kategoriaId: dto.kategoriaId ?? budget.kategoriaId,
        rok: dto.rok ?? budget.rok,
        miesiac: dto.miesiac ?? budget.miesiac,
        kwota: dto.kwota !== undefined ? (dto.kwota as any) : budget.kwota,
        roluj: dto.roluj !== undefined ? dto.roluj : budget.roluj,
      },
      include: { kategoria: true },
    });
  }

  async remove(userId: string, id: string) {
    const budget = await this.prisma.budzet.findFirst({
      where: { id, userId },
    });
    if (!budget) {
      throw new NotFoundException('Nie znaleziono budżetu.');
    }
    await this.prisma.budzet.delete({ where: { id } });
    return { ok: true };
  }
}


