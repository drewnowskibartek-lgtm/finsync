import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Podaj poprawny adres e-mail.' })
  email: string;

  @IsString({ message: 'Hasło jest wymagane.' })
  @MinLength(6, { message: 'Hasło musi mieć co najmniej 6 znaków.' })
  haslo: string;
}


