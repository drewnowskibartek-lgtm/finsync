import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AiService } from './ai.service';
import { ChatDto } from './dto/chat.dto';
import { FeatureGate } from '../common/decorators/feature.decorator';
import { FeatureGuard } from '../common/guards/feature.guard';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('ai')
@ApiBearerAuth()
@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private ai: AiService) {}

  @Post('chat')
  @ApiOperation({ summary: 'Asystent AI – czat' })
  async chat(@CurrentUser() user: { userId: string }, @Body() dto: ChatDto) {
    const reply = await this.ai.chat(user.userId, dto.message, dto.mode);
    return { reply };
  }

  @Post('report')
  @ApiOperation({ summary: 'Asystent AI – raport budżetu' })
  async report(@CurrentUser() user: { userId: string }) {
    const reply = await this.ai.report(user.userId);
    return { reply };
  }

  @Post('receipt/parse')
  @ApiOperation({ summary: 'OCR paragonu/faktury (Pro)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseGuards(FeatureGuard)
  @FeatureGate('RECEIPT_OCR')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  async parseReceipt(
    @CurrentUser() user: { userId: string },
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Brak pliku obrazu.');
    }
    const data = await this.ai.parseReceipt(
      user.userId,
      file.buffer,
      file.mimetype,
    );
    return { data };
  }
}


