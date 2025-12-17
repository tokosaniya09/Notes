import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
import { Socket } from 'socket.io';

interface AuthenticatedSocket extends Socket {
  user?: {
    id: string;
    email: string;
    firstName: string;
  };
}

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient<AuthenticatedSocket>();

    // 1️⃣ Extract token safely
    const rawToken =
      client.handshake.auth?.token ||
      client.handshake.headers?.authorization;

    if (!rawToken) {
      client.disconnect();
      return false;
    }

    const token = rawToken.replace('Bearer ', '');

    try {
      // 2️⃣ Verify token
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      // 3️⃣ Fetch user
      const user = await this.usersService.findById(payload.sub);

      if (!user) {
        client.disconnect();
        return false;
      }

      // 4️⃣ Attach user to socket (CRITICAL)
      client.user = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
      };

      return true;
    } catch (err) {
      // 5️⃣ Invalid / expired token
      client.disconnect();
      return false;
    }
  }
}
