import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../../database/entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import {
  BusinessRuleViolationException,
  ConflictDomainException,
  EntityNotFoundDomainException,
} from '../../common/domain/domain-exception.base';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const existing = await this.categoryRepository.findOne({
      where: [
        { name: createCategoryDto.name },
        { slug: createCategoryDto.slug },
      ],
    });

    if (existing) {
      throw new ConflictDomainException(
        'Category with this name or slug already exists',
      );
    }

    if (createCategoryDto.parent_id) {
      await this.findOne(createCategoryDto.parent_id);
    }

    const category = this.categoryRepository.create(createCategoryDto);
    return this.categoryRepository.save(category);
  }

  async findAll(): Promise<Category[]> {
    return this.categoryRepository.find({
      relations: ['parent', 'children'],
    });
  }

  async findOne(id: string): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['parent', 'children', 'products'],
    });
    if (!category) {
      throw new EntityNotFoundDomainException(
        `Category with ID "${id}" not found`,
      );
    }
    return category;
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    const category = await this.findOne(id);

    if (updateCategoryDto.name || updateCategoryDto.slug) {
      const existing = await this.categoryRepository.findOne({
        where: [
          { name: updateCategoryDto.name ?? category.name },
          { slug: updateCategoryDto.slug ?? category.slug },
        ],
      });
      if (existing && existing.id !== id) {
        throw new ConflictDomainException(
          'Category with this name or slug already exists',
        );
      }
    }

    if (updateCategoryDto.parent_id !== undefined) {
      if (updateCategoryDto.parent_id === id) {
        throw new BusinessRuleViolationException(
          'A category cannot be its own parent',
        );
      }

      if (updateCategoryDto.parent_id) {
        let currentParentId: string | null = updateCategoryDto.parent_id;
        const visited = new Set<string>([id]);
        while (currentParentId) {
          if (visited.has(currentParentId)) {
            throw new BusinessRuleViolationException(
              'Circular category hierarchy detected',
            );
          }
          visited.add(currentParentId);
          const parentCat = await this.findOne(currentParentId);
          currentParentId = parentCat.parent_id ?? null;
        }
      }
    }

    Object.assign(category, updateCategoryDto);
    return this.categoryRepository.save(category);
  }

  async remove(id: string): Promise<void> {
    const category = await this.findOne(id);

    if (category.children && category.children.length > 0) {
      throw new ConflictDomainException(
        'Cannot delete category because it has child categories',
      );
    }

    if (category.products && category.products.length > 0) {
      throw new ConflictDomainException(
        'Cannot delete category because it has products',
      );
    }

    await this.categoryRepository.remove(category);
  }
}
