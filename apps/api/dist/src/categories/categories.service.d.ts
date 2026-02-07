import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
export declare class CategoriesService {
    private prisma;
    constructor(prisma: PrismaService);
    list(userId: string): Promise<{
        id: string;
        utworzono: Date;
        userId: string | null;
        nazwa: string;
        globalna: boolean;
    }[]>;
    create(userId: string, dto: CreateCategoryDto): Promise<{
        id: string;
        utworzono: Date;
        userId: string | null;
        nazwa: string;
        globalna: boolean;
    }>;
}
