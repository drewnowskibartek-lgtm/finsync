import { IsString, MinLength } from 'class-validator';

export class CreateGlobalCategoryDto {
  @IsString({ message: 'Nazwa kategorii jest wymagana.' })
  @MinLength(2, { message: 'Nazwa kategorii musi mieć co najmniej 2 znaki.' })
  nazwa: string;
}


