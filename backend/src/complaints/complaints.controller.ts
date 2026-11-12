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
import { ComplaintsService } from './complaints.service';
import { CreateComplaintDto, ResolveComplaintDto } from './dto/complaint.dto';
import { ComplaintStatus } from '../database/entities/complaint.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('complaints')
export class ComplaintsController {
  constructor(private readonly complaintsService: ComplaintsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(@Query('status') status?: ComplaintStatus) {
    return this.complaintsService.findAll(status);
  }

  @Get('store/:storeId')
  @UseGuards(JwtAuthGuard)
  async findByStore(@Param('storeId') storeId: string) {
    return this.complaintsService.findByStore(storeId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @CurrentUser() user: any,
    @Body() dto: CreateComplaintDto,
  ) {
    return this.complaintsService.create(user.id, dto);
  }

  @Patch(':id/resolve')
  @UseGuards(JwtAuthGuard)
  async resolve(
    @Param('id') id: string,
    @Body() dto: ResolveComplaintDto,
  ) {
    return this.complaintsService.resolve(id, dto);
  }
}

