import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Czestotliwosc } from '@prisma/client';

export class UpdateRecurringDto {
  @IsOptional()
  @IsNumber({}, { message: 'Kwota musi być liczbą.' })
  @Min(0.01, { message: 'Kwota musi być większa od zera.' })
  @Type(() => Number)
  kwota?: number;

  @IsOptional()
  @IsString({ message: 'Kategoria musi być tekstem.' })
  kategoriaId?: string;

  @IsOptional()
  @IsString({ message: 'Odbiorca musi być tekstem.' })
  odbiorca?: string;

  @IsOptional()
  @IsString({ message: 'Metoda musi być tekstem.' })
  metoda?: string;

  @IsOptional()
  @IsString({ message: 'Notatka musi być tekstem.' })
  notatka?: string;

  @IsOptional()
  @IsEnum(Czestotliwosc, {
    message: 'Częstotliwość jest nieprawidłowa.',
  })
  czestotliwosc?: Czestotliwosc;

  @IsOptional()
  @IsString({ message: 'Następna data musi być tekstem.' })
  nastepnaData?: string;

  @IsOptional()
  @IsBoolean({ message: 'Aktywna musi być wartością logiczną.' })
  aktywna?: boolean;
}
