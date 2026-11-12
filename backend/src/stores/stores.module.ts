import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StoresService } from './stores.service';
import { StoresController } from './stores.controller';
import { Store } from '../database/entities/store.entity';
import { StoreCategory } from '../database/entities/store-category.entity';
import { User } from '../database/entities/user.entity';
import { Role } from '../database/entities/role.entity';
import { UserRole } from '../database/entities/user-role.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Store, StoreCategory, User, Role, UserRole]),
  ],
  controllers: [StoresController],
  providers: [StoresService],
  exports: [StoresService],
})
export class StoresModule {}

