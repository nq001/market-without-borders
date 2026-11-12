import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StoreRequestsService } from './store-requests.service';
import { StoreRequestsController } from './store-requests.controller';
import { StoreEditRequest } from '../database/entities/store-edit-request.entity';
import { Store } from '../database/entities/store.entity';

@Module({
  imports: [TypeOrmModule.forFeature([StoreEditRequest, Store])],
  controllers: [StoreRequestsController],
  providers: [StoreRequestsService],
  exports: [StoreRequestsService],
})
export class StoreRequestsModule {}

