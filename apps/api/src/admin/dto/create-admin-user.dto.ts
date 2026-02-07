import {
  IsBoolean,
  IsEmail,
  IsIn,
  IsOptional,
  MinLength,
} from 'class-validator';

export class CreateAdminUserDto {
  @IsEmail()
  email!: string;

  @MinLength(6, { message: 'Hasło musi mieć co najmniej 6 znaków.' })
  haslo!: string;

  @IsIn(['ADMIN', 'USER', 'VIEWER'])
  rola!: 'ADMIN' | 'USER' | 'VIEWER';

  @IsIn(['FREE', 'PRO'])
  plan!: 'FREE' | 'PRO';

  @IsOptional()
  @IsIn(['AKTYWNA', 'WSTRZYMANA', 'ANULOWANA', 'BRAK'])
  status?: 'AKTYWNA' | 'WSTRZYMANA' | 'ANULOWANA' | 'BRAK';

  @IsOptional()
  @IsBoolean()
  zablokowany?: boolean;
}


