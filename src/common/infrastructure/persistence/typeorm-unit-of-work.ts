import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { IUnitOfWork } from '../../application/unit-of-work.port';

@Injectable()
export class TypeOrmUnitOfWork implements IUnitOfWork {
  constructor(private readonly dataSource: DataSource) {}

  async runInTransaction<T>(
    work: (manager: EntityManager) => Promise<T>,
  ): Promise<T> {
    return this.dataSource.transaction(work);
  }
}
