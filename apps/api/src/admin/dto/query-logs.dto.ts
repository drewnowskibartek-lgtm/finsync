import { IsOptional, IsString } from 'class-validator';

export class QueryLogsDto {
  @IsOptional()
  @IsString({ message: 'Poziom musi być tekstem.' })
  poziom?: string;

  @IsOptional()
  @IsString({ message: 'Wyszukiwanie musi być tekstem.' })
  zawiera?: string;
}


