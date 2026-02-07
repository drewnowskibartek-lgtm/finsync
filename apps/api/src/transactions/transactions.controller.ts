import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { PlanLimitGate } from '../common/decorators/plan-limit.decorator';
import { PlanGuard } from '../common/guards/plan.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { FeatureGate } from '../common/decorators/feature.decorator';
import { FeatureGuard } from '../common/guards/feature.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import ExcelJS from 'exceljs';
import { QueryTransactionsDto } from './dto/query-transactions.dto';

@ApiTags('transactions')
@ApiBearerAuth()
@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionsController {
  constructor(private transactions: TransactionsService) {}

  @Get()
  @ApiQuery({
    name: 'od',
    required: false,
    description: 'Data od (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'do',
    required: false,
    description: 'Data do (YYYY-MM-DD)',
  })
  @ApiQuery({ name: 'kategoriaId', required: false })
  @ApiQuery({ name: 'kwotaMin', required: false })
  @ApiQuery({ name: 'kwotaMax', required: false })
  @ApiQuery({ name: 'szukaj', required: false })
  @ApiQuery({ name: 'waluta', required: false })
  @ApiQuery({ name: 'metoda', required: false })
  @ApiOperation({ summary: 'Lista transakcji użytkownika' })
  async list(
    @CurrentUser() user: { userId: string },
    @Query() query: QueryTransactionsDto,
  ) {
    return this.transactions.list(user.userId, query);
  }

  @Post()
  @UseGuards(PlanGuard, RolesGuard)
  @PlanLimitGate('TRANSACTIONS_MONTHLY')
  @Roles('ADMIN', 'USER')
  @ApiOperation({ summary: 'Utwórz transakcję' })
  async create(
    @CurrentUser() user: { userId: string },
    @Body() dto: CreateTransactionDto,
  ) {
    return this.transactions.create(user.userId, dto);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'USER')
  @ApiOperation({ summary: 'Edytuj transakcję' })
  async update(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
    @Body() dto: UpdateTransactionDto,
  ) {
    return this.transactions.update(user.userId, id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'USER')
  @ApiOperation({ summary: 'Usuń transakcję' })
  async remove(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
  ) {
    return this.transactions.remove(user.userId, id);
  }

  @Post('import')
  @UseGuards(FeatureGuard, RolesGuard)
  @FeatureGate('CSV_IMPORT')
  @Roles('ADMIN', 'USER')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiOperation({ summary: 'Import CSV transakcji (Pro)' })
  async importCsv(
    @CurrentUser() user: { userId: string },
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Brak pliku CSV.');
    }
    return this.transactions.importCsv(
      user.userId,
      file.buffer.toString('utf-8'),
    );
  }

  @Get('export')
  @UseGuards(FeatureGuard, RolesGuard)
  @FeatureGate('EXPORT')
  @Roles('ADMIN', 'USER')
  @ApiQuery({ name: 'format', required: false, enum: ['csv', 'xlsx'] })
  @ApiOperation({ summary: 'Eksport CSV/XLSX (Pro)' })
  async export(
    @CurrentUser() user: { userId: string },
    @Query('format') format: 'csv' | 'xlsx' = 'csv',
    @Res({ passthrough: true }) res: Response,
  ) {
    if (format === 'xlsx') {
      const rows = await this.transactions.exportRows(user.userId);
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('Transakcje');
      sheet.columns = [
        { header: 'data', key: 'data', width: 12 },
        { header: 'kwota', key: 'kwota', width: 12 },
        { header: 'waluta', key: 'waluta', width: 10 },
        { header: 'odbiorca', key: 'odbiorca', width: 24 },
        { header: 'referencja', key: 'referencja', width: 20 },
        { header: 'kategoria', key: 'kategoria', width: 20 },
        { header: 'metoda', key: 'metoda', width: 14 },
        { header: 'notatka', key: 'notatka', width: 24 },
      ];
      rows.forEach((r) => sheet.addRow(r));
      const buffer = await workbook.xlsx.writeBuffer();
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      res.setHeader(
        'Content-Disposition',
        'attachment; filename="transakcje.xlsx"',
      );
      return buffer;
    }
    const csv = await this.transactions.exportCsv(user.userId);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="transakcje.csv"',
    );
    return csv;
  }
}


