import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { StoresService } from './stores.service';
import { CreateStoreDto, UpdateStoreDto } from './dto/store.dto';
import { StoreStatus } from '../database/entities/store.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('stores')
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @Get()
  async findAll(@Query('status') status?: StoreStatus) {
    return this.storesService.findAll(status);
  }

  @Get('my-stores')
  @UseGuards(JwtAuthGuard)
  async getMyStores(@CurrentUser() user: any) {
    return this.storesService.findByOwner(user.id);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.storesService.findById(id);
  }

  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string) {
    return this.storesService.findBySlug(slug);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() dto: CreateStoreDto) {
    return this.storesService.create(dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(@Param('id') id: string, @Body() dto: UpdateStoreDto) {
    return this.storesService.update(id, dto);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  async setStatus(
    @Param('id') id: string,
    @Body('status') status: StoreStatus,
  ) {
    return this.storesService.setStatus(id, status);
  }

  @Post(':id/categories/:categoryId')
  @UseGuards(JwtAuthGuard)
  async linkCategory(
    @Param('id') id: string,
    @Param('categoryId') categoryId: string,
  ) {
    await this.storesService.linkCategory(id, categoryId);
    return { success: true };
  }

  @Delete(':id/categories/:categoryId')
  @UseGuards(JwtAuthGuard)
  async unlinkCategory(
    @Param('id') id: string,
    @Param('categoryId') categoryId: string,
  ) {
    await this.storesService.unlinkCategory(id, categoryId);
    return { success: true };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async delete(@Param('id') id: string) {
    await this.storesService.delete(id);
    return { success: true, message: 'Store removed successfully' };
  }
}

