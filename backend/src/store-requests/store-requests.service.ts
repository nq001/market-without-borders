import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  StoreEditRequest,
  StoreEditRequestStatus,
} from '../database/entities/store-edit-request.entity';
import { Store } from '../database/entities/store.entity';
import {
  CreateStoreEditRequestDto,
  ReviewStoreEditRequestDto,
} from './dto/store-request.dto';

@Injectable()
export class StoreRequestsService {
  constructor(
    @InjectRepository(StoreEditRequest)
    private readonly requestRepo: Repository<StoreEditRequest>,
    @InjectRepository(Store)
    private readonly storeRepo: Repository<Store>,
  ) {}

  async findAll(status?: StoreEditRequestStatus): Promise<StoreEditRequest[]> {
    const qb = this.requestRepo
      .createQueryBuilder('req')
      .leftJoinAndSelect('req.store', 'store')
      .leftJoinAndSelect('req.owner', 'owner')
      .orderBy('req.created_at', 'DESC');

    if (status) {
      qb.where('req.status = :status', { status });
    }

    return qb.getMany();
  }

  async findByStore(storeId: string): Promise<StoreEditRequest[]> {
    return this.requestRepo.find({
      where: { store_id: storeId },
      relations: ['store', 'owner'],
      order: { created_at: 'DESC' },
    });
  }

  async create(
    ownerId: string,
    dto: CreateStoreEditRequestDto,
  ): Promise<StoreEditRequest> {
    const store = await this.storeRepo.findOne({
      where: { id: dto.store_id, owner_id: ownerId },
    });

    if (!store) {
      throw new NotFoundException('Store not found or unauthorized owner');
    }

    const req = this.requestRepo.create({
      store_id: dto.store_id,
      owner_id: ownerId,
      requested_changes: dto.requested_changes,
      status: StoreEditRequestStatus.PENDING,
    });

    return this.requestRepo.save(req);
  }

  async resubmit(
    id: string,
    ownerId: string,
    dto: Partial<CreateStoreEditRequestDto>,
  ): Promise<StoreEditRequest> {
    const req = await this.requestRepo.findOne({
      where: { id, owner_id: ownerId },
    });

    if (!req) {
      throw new NotFoundException('Store edit request not found');
    }

    if (req.status !== StoreEditRequestStatus.REJECTED) {
      throw new BadRequestException('Only rejected requests can be resubmitted');
    }

    if (dto.requested_changes) {
      req.requested_changes = dto.requested_changes;
    }
    req.status = StoreEditRequestStatus.PENDING;
    req.rejection_reason = null;

    return this.requestRepo.save(req);
  }

  async review(
    id: string,
    dto: ReviewStoreEditRequestDto,
  ): Promise<StoreEditRequest> {
    const req = await this.requestRepo.findOne({
      where: { id },
      relations: ['store'],
    });

    if (!req) {
      throw new NotFoundException('Store edit request not found');
    }

    if (dto.status === 'REJECTED' && !dto.rejection_reason) {
      throw new BadRequestException('Rejection reason is required when rejecting');
    }

    req.status = dto.status as StoreEditRequestStatus;
    req.rejection_reason = dto.rejection_reason || null;

    if (dto.status === 'APPROVED' && req.store) {
      // Apply the approved changes directly to the store
      const ch = req.requested_changes;
      if (ch.name) req.store.name = ch.name;
      if (ch.description !== undefined) req.store.description = ch.description;
      if (ch.banner_url !== undefined) req.store.banner_url = ch.banner_url;
      if (ch.theme_config !== undefined) req.store.theme_config = ch.theme_config;

      await this.storeRepo.save(req.store);
    }

    return this.requestRepo.save(req);
  }
}

