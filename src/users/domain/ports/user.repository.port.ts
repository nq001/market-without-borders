import { User } from '../../../database/entities/user.entity';

export const USER_REPOSITORY_PORT = 'USER_REPOSITORY_PORT';

export interface IUserRepositoryPort {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  createCustomerUser(userData: Partial<User>): Promise<User>;
}
