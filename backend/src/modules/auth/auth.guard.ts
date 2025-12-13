import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard as PassportAuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends PassportAuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    // Add custom logic here if needed (e.g. public routes bypass)
    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    // You can throw a custom exception here based on "info" argument
    if (err || !user) {
      throw err || new UnauthorizedException('Invalid or expired token');
    }
    return user;
  }
}
