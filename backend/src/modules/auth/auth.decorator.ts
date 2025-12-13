import { createParamDecorator, ExecutionContext, SetMetadata } from '@nestjs/common';
import { SubscriptionTier } from '../users/entities/user.entity';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: SubscriptionTier[]) => SetMetadata(ROLES_KEY, roles);

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);