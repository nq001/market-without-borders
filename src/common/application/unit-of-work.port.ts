import { EntityManager } from 'typeorm';

export const UNIT_OF_WORK_PORT = 'UNIT_OF_WORK_PORT';

export interface IUnitOfWork {
  runInTransaction<T>(work: (manager: EntityManager) => Promise<T>): Promise<T>;
}

