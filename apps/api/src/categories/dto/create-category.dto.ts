import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateCategoryDto {
  @IsString({ message: 'Nazwa kategorii jest wymagana.' })
  nazwa: string;

  @IsOptional()
  @IsBoolean({ message: 'Pole globalna musi być wartością logiczną.' })
  globalna?: boolean;
}


