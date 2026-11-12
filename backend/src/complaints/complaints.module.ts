import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComplaintsService } from './complaints.service';
import { ComplaintsController } from './complaints.controller';
import { Complaint } from '../database/entities/complaint.entity';
import { Store } from '../database/entities/store.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Complaint, Store])],
  controllers: [ComplaintsController],
  providers: [ComplaintsService],
  exports: [ComplaintsService],
})
export class ComplaintsModule {}

