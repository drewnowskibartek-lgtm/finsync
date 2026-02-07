import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateRecurringDto {
  @Type(() => Number)
  @IsNumber({}, { message: 'Kwota musi być liczbą.' })
  kwota: number;

  @IsOptional()
  @IsString({ message: 'Kategoria musi być tekstem.' })
  kategoriaId?: string;

  @IsString({ message: 'Odbiorca jest wymagany.' })
  odbiorca: string;

  @IsOptional()
  @IsString({ message: 'Metoda musi być tekstem.' })
  metoda?: string;

  @IsOptional()
  @IsString({ message: 'Notatka musi być tekstem.' })
  notatka?: string;

  @IsEnum(['DZIENNA', 'TYGODNIOWA', 'MIESIECZNA', 'ROCZNA'], {
    message: 'Częstotliwość jest nieprawidłowa.',
  })
  czestotliwosc: 'DZIENNA' | 'TYGODNIOWA' | 'MIESIECZNA' | 'ROCZNA';

  @IsDateString({}, { message: 'Podaj poprawną datę następnej transakcji.' })
  nastepnaData: string;
}


