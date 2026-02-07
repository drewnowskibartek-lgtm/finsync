import { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
export declare class HttpExceptionFilter implements ExceptionFilter {
    private prisma;
    constructor(prisma: PrismaService);
    catch(exception: unknown, host: ArgumentsHost): void;
}
