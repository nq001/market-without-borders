import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { StoreRequestsService } from './store-requests.service';
import {
  CreateStoreEditRequestDto,
  ReviewStoreEditRequestDto,
} from './dto/store-request.dto';
import { StoreEditRequestStatus } from '../database/entities/store-edit-request.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('store-requests')
export class StoreRequestsController {
  constructor(private readonly requestsService: StoreRequestsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(@Query('status') status?: StoreEditRequestStatus) {
    return this.requestsService.findAll(status);
  }

  @Get('store/:storeId')
  @UseGuards(JwtAuthGuard)
  async findByStore(@Param('storeId') storeId: string) {
    return this.requestsService.findByStore(storeId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @CurrentUser() user: any,
    @Body() dto: CreateStoreEditRequestDto,
  ) {
    return this.requestsService.create(user.id, dto);
  }

  @Patch(':id/resubmit')
  @UseGuards(JwtAuthGuard)
  async resubmit(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() dto: Partial<CreateStoreEditRequestDto>,
  ) {
    return this.requestsService.resubmit(id, user.id, dto);
  }

  @Patch(':id/review')
  @UseGuards(JwtAuthGuard)
  async review(
    @Param('id') id: string,
    @Body() dto: ReviewStoreEditRequestDto,
  ) {
    return this.requestsService.review(id, dto);
  }
}

