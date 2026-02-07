import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async list(userId: string) {
    return this.prisma.kategoria.findMany({
      where: {
        OR: [{ globalna: true }, { userId }],
      },
      orderBy: { nazwa: 'asc' },
    });
  }

  async create(userId: string, dto: CreateCategoryDto) {
    if (dto.globalna) {
      throw new ForbiddenException(
        'Nie masz uprawnień do tworzenia kategorii globalnych.',
      );
    }
    return this.prisma.kategoria.create({
      data: {
        nazwa: dto.nazwa,
        globalna: false,
        userId,
      },
    });
  }
}


