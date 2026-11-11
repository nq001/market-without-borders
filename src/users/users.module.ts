import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { User } from '../database/entities/user.entity';
import { Role } from '../database/entities/role.entity';
import { Permission } from '../database/entities/permission.entity';
import { UserRole } from '../database/entities/user-role.entity';
import { RolePermission } from '../database/entities/role-permission.entity';
import { USER_REPOSITORY_PORT } from './domain/ports/user.repository.port';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Role,
      Permission,
      UserRole,
      RolePermission,
    ]),
  ],
  providers: [
    UsersService,
    {
      provide: USER_REPOSITORY_PORT,
      useExisting: UsersService,
    },
  ],
  exports: [UsersService, USER_REPOSITORY_PORT],
})
export class UsersModule {}
