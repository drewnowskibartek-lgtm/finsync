import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Response } from 'express';
import { PrismaService } from '../../prisma/prisma.service';

@Catch()
@Injectable()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private prisma: PrismaService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Wewnętrzny błąd serwera.';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res && 'message' in res) {
        // @ts-expect-error - bezpieczny odczyt
        message = res.message ?? message;
      }
    }

    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
    });

    if (status >= 500) {
      this.prisma.logSystemowy
        .create({
          data: {
            poziom: 'ERROR',
            wiadomosc: typeof message === 'string' ? message : 'Błąd serwera.',
          },
        })
        .catch(() => undefined);
    }
  }
}


