import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { FeatureGate } from '../common/decorators/feature.decorator';
import { FeatureGuard } from '../common/guards/feature.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { ApiOperation } from '@nestjs/swagger';

@ApiTags('categories')
@ApiBearerAuth()
@Controller('categories')
@UseGuards(JwtAuthGuard)
export class CategoriesController {
  constructor(private categories: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'Lista kategorii (globalne + własne)' })
  async list(@CurrentUser() user: { userId: string }) {
    return this.categories.list(user.userId);
  }

  @Post()
  @UseGuards(FeatureGuard, RolesGuard)
  @FeatureGate('CUSTOM_CATEGORIES')
  @Roles('ADMIN', 'USER')
  @ApiOperation({ summary: 'Dodaj własną kategorię (Pro)' })
  async create(
    @CurrentUser() user: { userId: string },
    @Body() dto: CreateCategoryDto,
  ) {
    return this.categories.create(user.userId, dto);
  }
}


