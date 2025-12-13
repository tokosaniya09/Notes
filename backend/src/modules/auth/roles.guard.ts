import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SubscriptionTier } from '../users/entities/user.entity';
import { ROLES_KEY } from './auth.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<SubscriptionTier[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true; // No roles required
    }

    const { user } = context.switchToHttp().getRequest();
    
    // Logic: If user has 'TEAM' tier, they might access 'PRO' features too. 
    // For now, strict equality. In production, use a hierarchy check.
    const hasRole = requiredRoles.some((role) => user.tier === role);

    if (!hasRole) {
      throw new ForbiddenException(`Requires one of the following tiers: ${requiredRoles.join(', ')}`);
    }

    return true;
  }
}