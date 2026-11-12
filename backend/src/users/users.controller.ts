import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll() {
    return this.usersService.findAllUsers();
  }

  @Patch(':id/approval')
  @UseGuards(JwtAuthGuard)
  async updateApproval(
    @Param('id') id: string,
    @Body('status') status: 'PENDING_APPROVAL' | 'ACTIVE' | 'SUSPENDED',
  ) {
    return this.usersService.updateApprovalStatus(id, status);
  }

  @Patch(':id/role')
  @UseGuards(JwtAuthGuard)
  async changeRole(
    @Param('id') id: string,
    @Body('role') role: 'OWNER' | 'CUSTOMER',
  ) {
    return this.usersService.changeRole(id, role);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteUser(
    @Param('id') id: string,
    @Query('deleteStore') deleteStore?: string,
  ) {
    await this.usersService.deleteUser(id, deleteStore === 'true');
    return { success: true, message: 'User deleted successfully' };
  }
}

