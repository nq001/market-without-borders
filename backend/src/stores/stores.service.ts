import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Store, StoreStatus } from '../database/entities/store.entity';
import { StoreCategory } from '../database/entities/store-category.entity';
import { User } from '../database/entities/user.entity';
import { Role } from '../database/entities/role.entity';
import { UserRole } from '../database/entities/user-role.entity';
import { CreateStoreDto, UpdateStoreDto } from './dto/store.dto';

@Injectable()
export class StoresService {
  constructor(
    @InjectRepository(Store)
    private readonly storeRepo: Repository<Store>,
    @InjectRepository(StoreCategory)
    private readonly storeCategoryRepo: Repository<StoreCategory>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
    @InjectRepository(UserRole)
    private readonly userRoleRepo: Repository<UserRole>,
  ) {}

  async findAll(status?: StoreStatus): Promise<Store[]> {
    const qb = this.storeRepo
      .createQueryBuilder('store')
      .leftJoinAndSelect('store.owner', 'owner')
      .leftJoinAndSelect('store.storeCategories', 'sc')
      .leftJoinAndSelect('sc.category', 'cat')
      .loadRelationCountAndMap('store.productsCount', 'store.products');

    if (status) {
      qb.where('store.status = :status', { status });
    }

    return qb.orderBy('store.created_at', 'DESC').getMany();
  }

  async findById(id: string): Promise<Store> {
    const store = await this.storeRepo
      .createQueryBuilder('store')
      .leftJoinAndSelect('store.owner', 'owner')
      .leftJoinAndSelect('store.storeCategories', 'sc')
      .leftJoinAndSelect('sc.category', 'cat')
      .leftJoinAndSelect('store.products', 'prod')
      .where('store.id = :id', { id })
      .getOne();

    if (!store) {
      throw new NotFoundException(`Store with ID "${id}" not found`);
    }
    return store;
  }

  async findBySlug(slug: string): Promise<Store> {
    const store = await this.storeRepo
      .createQueryBuilder('store')
      .leftJoinAndSelect('store.owner', 'owner')
      .leftJoinAndSelect('store.storeCategories', 'sc')
      .leftJoinAndSelect('sc.category', 'cat')
      .leftJoinAndSelect('store.products', 'prod')
      .where('store.slug = :slug', { slug })
      .getOne();

    if (!store) {
      throw new NotFoundException(`Store with slug "${slug}" not found`);
    }
    return store;
  }

  async findByOwner(ownerId: string): Promise<Store[]> {
    return this.storeRepo.find({
      where: { owner_id: ownerId },
      relations: ['storeCategories', 'storeCategories.category'],
    });
  }

  async create(dto: CreateStoreDto): Promise<Store> {
    const existing = await this.storeRepo.findOne({
      where: [{ name: dto.name }, { slug: dto.slug }],
    });
    if (existing) {
      throw new ConflictException('A store with this name or slug already exists');
    }

    // Verify owner exists and elevate role to OWNER if not already
    const owner = await this.userRepo.findOne({ where: { id: dto.owner_id } });
    if (!owner) {
      throw new NotFoundException('Designated owner user not found');
    }

    const ownerRole = await this.roleRepo.findOne({ where: { name: 'OWNER' } });
    if (ownerRole) {
      const existingUserRole = await this.userRoleRepo.findOne({
        where: { user_id: owner.id, role_id: ownerRole.id },
      });
      if (!existingUserRole) {
        await this.userRoleRepo.save(
          this.userRoleRepo.create({ user_id: owner.id, role_id: ownerRole.id }),
        );
      }
    }

    const store = this.storeRepo.create({
      name: dto.name,
      slug: dto.slug,
      description: dto.description,
      owner_id: dto.owner_id,
      banner_url: dto.banner_url,
      status: StoreStatus.ACTIVE,
    });

    return this.storeRepo.save(store);
  }

  async update(id: string, dto: UpdateStoreDto): Promise<Store> {
    const store = await this.findById(id);
    if (dto.name) store.name = dto.name;
    if (dto.description !== undefined) store.description = dto.description;
    if (dto.banner_url !== undefined) store.banner_url = dto.banner_url;
    if (dto.status) store.status = dto.status as StoreStatus;
    if (dto.owner_id) {
      store.owner_id = dto.owner_id;
      // elevate role
      const ownerRole = await this.roleRepo.findOne({ where: { name: 'OWNER' } });
      if (ownerRole) {
        const ur = await this.userRoleRepo.findOne({
          where: { user_id: dto.owner_id, role_id: ownerRole.id },
        });
        if (!ur) {
          await this.userRoleRepo.save(
            this.userRoleRepo.create({ user_id: dto.owner_id, role_id: ownerRole.id }),
          );
        }
      }
    }

    return this.storeRepo.save(store);
  }

  async setStatus(id: string, status: StoreStatus): Promise<Store> {
    const store = await this.findById(id);
    store.status = status;
    return this.storeRepo.save(store);
  }

  async linkCategory(storeId: string, categoryId: string): Promise<void> {
    const existing = await this.storeCategoryRepo.findOne({
      where: { store_id: storeId, category_id: categoryId },
    });
    if (!existing) {
      await this.storeCategoryRepo.save(
        this.storeCategoryRepo.create({ store_id: storeId, category_id: categoryId }),
      );
    }
  }

  async unlinkCategory(storeId: string, categoryId: string): Promise<void> {
    await this.storeCategoryRepo.delete({ store_id: storeId, category_id: categoryId });
  }

  async delete(id: string): Promise<void> {
    const store = await this.findById(id);
    await this.storeRepo.softRemove(store);
  }
}

