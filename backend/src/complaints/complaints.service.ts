import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Complaint,
  ComplaintStatus,
  ComplaintAdminAction,
} from '../database/entities/complaint.entity';
import { Store, StoreStatus } from '../database/entities/store.entity';
import { CreateComplaintDto, ResolveComplaintDto } from './dto/complaint.dto';

@Injectable()
export class ComplaintsService {
  constructor(
    @InjectRepository(Complaint)
    private readonly complaintRepo: Repository<Complaint>,
    @InjectRepository(Store)
    private readonly storeRepo: Repository<Store>,
  ) {}

  async findAll(status?: ComplaintStatus): Promise<Complaint[]> {
    const qb = this.complaintRepo
      .createQueryBuilder('complaint')
      .leftJoinAndSelect('complaint.customer', 'customer')
      .leftJoinAndSelect('complaint.store', 'store')
      .leftJoinAndSelect('complaint.order', 'order')
      .orderBy('complaint.created_at', 'DESC');

    if (status) {
      qb.where('complaint.status = :status', { status });
    }

    return qb.getMany();
  }

  async findByStore(storeId: string): Promise<Complaint[]> {
    return this.complaintRepo.find({
      where: { store_id: storeId },
      relations: ['customer', 'order'],
      order: { created_at: 'DESC' },
    });
  }

  async create(customerId: string, dto: CreateComplaintDto): Promise<Complaint> {
    const store = await this.storeRepo.findOne({ where: { id: dto.store_id } });
    if (!store) {
      throw new NotFoundException(`Store with ID "${dto.store_id}" not found`);
    }

    const complaint = this.complaintRepo.create({
      customer_id: customerId,
      store_id: dto.store_id,
      order_id: dto.order_id || null,
      reason: dto.reason,
      details: dto.details,
      status: ComplaintStatus.PENDING,
      admin_action: ComplaintAdminAction.NONE,
    });

    return this.complaintRepo.save(complaint);
  }

  async resolve(id: string, dto: ResolveComplaintDto): Promise<Complaint> {
    const complaint = await this.complaintRepo.findOne({
      where: { id },
      relations: ['store'],
    });

    if (!complaint) {
      throw new NotFoundException(`Complaint with ID "${id}" not found`);
    }

    complaint.status = dto.status as ComplaintStatus;
    if (dto.admin_action) {
      complaint.admin_action = dto.admin_action as ComplaintAdminAction;
    }
    if (dto.admin_notes !== undefined) {
      complaint.admin_notes = dto.admin_notes;
    }

    // If admin action is to suspend store, update store immediately
    if (dto.admin_action === 'STORE_SUSPENDED' && complaint.store_id) {
      await this.storeRepo.update(complaint.store_id, {
        status: StoreStatus.SUSPENDED,
      });
    }

    return this.complaintRepo.save(complaint);
  }
}

