import { Injectable, Optional } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Product } from '../../database/entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { GetProductsFilterDto } from './dto/get-products-filter.dto';
import { CategoriesService } from '../categories/categories.service';
import { InventoryService } from '../../inventory/inventory.service';
import {
  BusinessRuleViolationException,
  ConflictDomainException,
  EntityNotFoundDomainException,
} from '../../common/domain/domain-exception.base';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly categoriesService: CategoriesService,
    private readonly inventoryService: InventoryService,
    @Optional()
    private readonly dataSource?: DataSource,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const existing = await this.productRepository.findOne({
      where: { sku: createProductDto.sku },
    });
    if (existing) {
      throw new ConflictDomainException('Product with this SKU already exists');
    }

    try {
      await this.categoriesService.findOne(createProductDto.category_id);
    } catch {
      throw new BusinessRuleViolationException('Invalid category_id');
    }

    if (this.dataSource) {
      return this.dataSource.transaction(async (manager) => {
        const product = manager.create(Product, createProductDto);
        const savedProduct = await manager.save(Product, product);
        const inventory = await this.inventoryService.initializeInventory(
          savedProduct.id,
          0,
          manager,
        );
        savedProduct.inventory = inventory;
        return savedProduct;
      });
    }

    const product = this.productRepository.create(createProductDto);
    const savedProduct = await this.productRepository.save(product);
    await this.inventoryService.initializeInventory(savedProduct.id, 0);
    return savedProduct;
  }

  async findAll(filterDto: GetProductsFilterDto, isAdmin = false) {
    const {
      search,
      category_id,
      min_price,
      max_price,
      sort_by,
      order,
      page = 1,
      limit = 20,
    } = filterDto;

    const query = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.inventory', 'inventory');

    if (!isAdmin) {
      query.andWhere('product.is_active = :isActive', { isActive: true });
    }

    if (search) {
      query.andWhere(
        '(product.name ILIKE :search OR product.description ILIKE :search OR product.sku ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (category_id) {
      query.andWhere('product.category_id = :categoryId', {
        categoryId: category_id,
      });
    }

    if (min_price !== undefined) {
      query.andWhere('product.price >= :minPrice', { minPrice: min_price });
    }

    if (max_price !== undefined) {
      query.andWhere('product.price <= :maxPrice', { maxPrice: max_price });
    }

    if (sort_by) {
      query.orderBy(`product.${sort_by}`, order || 'ASC');
    } else {
      query.orderBy('product.created_at', 'DESC');
    }

    const maxLimit = Math.min(limit, 100);
    const skip = (page - 1) * maxLimit;

    query.skip(skip).take(maxLimit);

    const [items, total] = await query.getManyAndCount();

    return {
      items,
      total,
      page,
      limit: maxLimit,
      total_pages: Math.ceil(total / maxLimit),
    };
  }

  async findOne(id: string, isAdmin = false): Promise<Product> {
    const query = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.inventory', 'inventory')
      .where('product.id = :id', { id });

    if (!isAdmin) {
      query.andWhere('product.is_active = :isActive', { isActive: true });
    }

    const product = await query.getOne();

    if (!product) {
      throw new EntityNotFoundDomainException(
        `Product with ID "${id}" not found`,
      );
    }

    return product;
  }

  async findActiveById(id: string): Promise<Product | null> {
    return this.productRepository.findOne({
      where: { id, is_active: true },
    });
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const product = await this.findOne(id, true);

    if (updateProductDto.sku && updateProductDto.sku !== product.sku) {
      const existing = await this.productRepository.findOne({
        where: { sku: updateProductDto.sku },
      });
      if (existing) {
        throw new ConflictDomainException(
          'Product with this SKU already exists',
        );
      }
    }

    if (
      updateProductDto.category_id &&
      updateProductDto.category_id !== product.category_id
    ) {
      try {
        await this.categoriesService.findOne(updateProductDto.category_id);
      } catch {
        throw new BusinessRuleViolationException('Invalid category_id');
      }
    }

    Object.assign(product, updateProductDto);
    return this.productRepository.save(product);
  }

  async remove(id: string): Promise<void> {
    const product = await this.findOne(id, true);
    await this.productRepository.softRemove(product);
  }
}
