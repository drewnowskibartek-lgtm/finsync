import { IsEnum, IsString, MinLength } from 'class-validator';

export class ChatDto {
  @IsString({ message: 'Wiadomość jest wymagana.' })
  @MinLength(2, { message: 'Wiadomość musi mieć co najmniej 2 znaki.' })
  message: string;

  @IsEnum(['help', 'analysis', 'report'], {
    message: 'Tryb musi być jednym z: help, analysis, report.',
  })
  mode: 'help' | 'analysis' | 'report';
}


