import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async log(
    userId: string,
    akcja: string,
    transakcjaId?: string,
    notatka?: string,
  ) {
    return this.prisma.auditLog.create({
      data: { userId, akcja, transakcjaId, notatka },
    });
  }

  async logAutoIfPro(userId: string, akcja: string, transakcjaId?: string) {
    const sub = await this.prisma.subskrypcja.findUnique({
      where: { userId },
    });
    if (sub?.plan === 'PRO') {
      await this.log(userId, akcja, transakcjaId);
    }
  }

  async list(userId: string) {
    return this.prisma.auditLog.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
    });
  }
}
