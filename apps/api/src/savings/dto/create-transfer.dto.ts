import { Type } from 'class-transformer';
import {
  IsDateString,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateSavingsTransferDto {
  @IsString({ message: 'Typ jest wymagany.' })
  @IsIn(['DO_OSZCZEDNOSCI', 'DO_BUDZETU'], {
    message: 'Nieprawidłowy typ transferu.',
  })
  typ: 'DO_OSZCZEDNOSCI' | 'DO_BUDZETU';

  @Type(() => Number)
  @IsNumber({}, { message: 'Kwota musi być liczbą.' })
  kwota: number;

  @IsString({ message: 'Waluta jest wymagana.' })
  @MinLength(3, { message: 'Waluta musi mieć 3 znaki.' })
  @MaxLength(3, { message: 'Waluta musi mieć 3 znaki.' })
  waluta: string;

  @IsOptional()
  @IsDateString({}, { message: 'Podaj poprawną datę.' })
  data?: string;

  @IsOptional()
  @IsString({ message: 'Notatka musi być tekstem.' })
  notatka?: string;
}
