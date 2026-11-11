import { Injectable, Optional } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { User } from '../database/entities/user.entity';
import { Role } from '../database/entities/role.entity';
import { UserRole } from '../database/entities/user-role.entity';
import { ConflictDomainException } from '../common/domain/domain-exception.base';
import { IUserRepositoryPort } from './domain/ports/user.repository.port';

@Injectable()
export class UsersService implements IUserRepositoryPort {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @Optional()
    @InjectRepository(UserRole)
    private readonly userRoleRepository?: Repository<UserRole>,
    @Optional()
    private readonly dataSource?: DataSource,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      relations: [
        'userRoles',
        'userRoles.role',
        'userRoles.role.rolePermissions',
        'userRoles.role.rolePermissions.permission',
      ],
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id },
      relations: [
        'userRoles',
        'userRoles.role',
        'userRoles.role.rolePermissions',
        'userRoles.role.rolePermissions.permission',
      ],
    });
  }

  async create(userData: Partial<User>): Promise<User> {
    const existing = await this.userRepository.findOne({
      where: { email: userData.email },
    });
    if (existing) {
      throw new ConflictDomainException('Email already in use');
    }

    const user = this.userRepository.create(userData);
    return this.userRepository.save(user);
  }

  async createCustomerUser(userData: Partial<User>): Promise<User> {
    if (this.dataSource) {
      return this.dataSource.transaction(async (manager) => {
        const existing = await manager.findOne(User, {
          where: { email: userData.email },
        });
        if (existing) {
          throw new ConflictDomainException('Email already in use');
        }

        const user = manager.create(User, userData);
        const savedUser = await manager.save(User, user);

        const defaultRole = await manager.findOne(Role, {
          where: { name: 'CUSTOMER' },
        });
        if (!defaultRole) {
          throw new Error(
            'Default role CUSTOMER not found. Did you run the seed script?',
          );
        }

        const userRole = manager.create(UserRole, {
          user: savedUser,
          role: defaultRole,
        });
        await manager.save(UserRole, userRole);

        return savedUser;
      });
    }

    const user = await this.create(userData);
    const defaultRole = await this.getDefaultRole();
    if (this.userRoleRepository) {
      await this.userRoleRepository.save(
        this.userRoleRepository.create({
          user,
          role: defaultRole,
        }),
      );
    }
    return user;
  }

  async getDefaultRole(): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { name: 'CUSTOMER' },
    });
    if (!role) {
      throw new Error(
        'Default role CUSTOMER not found. Did you run the seed script?',
      );
    }
    return role;
  }
}
