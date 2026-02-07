import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
export declare class CategoriesController {
    private categories;
    constructor(categories: CategoriesService);
    list(user: {
        userId: string;
    }): Promise<{
        id: string;
        utworzono: Date;
        userId: string | null;
        nazwa: string;
        globalna: boolean;
    }[]>;
    create(user: {
        userId: string;
    }, dto: CreateCategoryDto): Promise<{
        id: string;
        utworzono: Date;
        userId: string | null;
        nazwa: string;
        globalna: boolean;
    }>;
}
