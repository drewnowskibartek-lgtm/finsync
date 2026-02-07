import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateTransactionDto {
  @IsDateString({}, { message: 'Podaj poprawną datę.' })
  data: string;

  @Type(() => Number)
  @IsNumber({}, { message: 'Kwota musi być liczbą.' })
  kwota: number;

  @IsString({ message: 'Waluta jest wymagana.' })
  @MinLength(3, { message: 'Waluta musi mieć 3 znaki.' })
  @MaxLength(3, { message: 'Waluta musi mieć 3 znaki.' })
  waluta: string;

  @IsString({ message: 'Odbiorca jest wymagany.' })
  @MinLength(2, { message: 'Odbiorca musi mieć co najmniej 2 znaki.' })
  odbiorca: string;

  @IsOptional()
  @IsString({ message: 'Referencja musi być tekstem.' })
  referencja?: string;

  @IsOptional()
  @IsString({ message: 'Kategoria musi być tekstem.' })
  kategoriaId?: string;

  @IsOptional()
  @IsString({ message: 'Metoda musi być tekstem.' })
  metoda?: string;

  @IsOptional()
  @IsString({ message: 'Notatka musi być tekstem.' })
  notatka?: string;

  @IsOptional()
  @IsBoolean({ message: 'Czy uzgodnione musi być wartością logiczną.' })
  czyUzgodnione?: boolean;
}


