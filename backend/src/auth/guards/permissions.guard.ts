import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { TokenPayload } from '../auth.service';

const PERMISSION_GROUP_ALIASES: Record<string, string[]> = {
  CREATE_CATEGORY: ['catalog.manage'],
  UPDATE_CATEGORY: ['catalog.manage'],
  DELETE_CATEGORY: ['catalog.manage'],
  CREATE_PRODUCT: ['catalog.manage'],
  UPDATE_PRODUCT: ['catalog.manage'],
  DELETE_PRODUCT: ['catalog.manage'],
  ADJUST_INVENTORY: ['inventory.update'],
  VIEW_INVENTORY: ['inventory.update'],
  CREATE_COUPON: ['coupons.manage', 'catalog.manage'],
  VIEW_COUPON: ['coupons.manage', 'catalog.manage'],
  UPDATE_COUPON: ['coupons.manage', 'catalog.manage'],
  DELETE_COUPON: ['coupons.manage', 'catalog.manage'],
  APPROVE_REVIEW: ['reviews.approve', 'catalog.manage'],
  MANAGE_SHIPPING: ['shipping.manage'],
  ADMIN: ['shipping.manage'],
};

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{
      user?: TokenPayload;
    }>();
    const payload = request.user;

    if (!payload) {
      return false;
    }

    const roles = Array.isArray(payload.roles) ? payload.roles : [];
    if (roles.includes('ADMIN')) {
      return true;
    }

    const userPermissions = Array.isArray(payload.permissions)
      ? payload.permissions
      : [];

    const hasPermission = requiredPermissions.every((requiredPerm) => {
      if (userPermissions.includes(requiredPerm)) {
        return true;
      }
      const aliases = PERMISSION_GROUP_ALIASES[requiredPerm] ?? [];
      return aliases.some((alias) => userPermissions.includes(alias));
    });

    if (!hasPermission) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
