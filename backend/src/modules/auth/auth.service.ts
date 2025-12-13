import { 
  ConflictException, 
  Injectable, 
  InternalServerErrorException, 
  Logger, 
  UnauthorizedException 
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../database/prisma.service';
import { TokenDto } from './dto/token.dto';
import { LoginDto, RegisterDto } from './dto/login.dto';
import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import { UsersService } from '../users/users.service';
import { Buffer } from 'buffer';
import { SubscriptionTier } from '../users/entities/user.entity';

const scryptAsync = promisify(scrypt);

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private prisma: PrismaService, // Kept for edge cases, but prefer UsersService
  ) {}

  /**
   * UTILITY: Hash Password
   * Uses native Node.js crypto (scrypt) to avoid external dependencies like bcrypt
   */
  private async hashPassword(password: string): Promise<string> {
    const salt = randomBytes(16).toString('hex');
    const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
    return `${salt}:${derivedKey.toString('hex')}`;
  }

  /**
   * UTILITY: Verify Password
   */
  private async verifyPassword(password: string, hash: string): Promise<boolean> {
    const [salt, key] = hash.split(':');
    const keyBuffer = Buffer.from(key, 'hex');
    const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
    return timingSafeEqual(keyBuffer, derivedKey);
  }

  /**
   * Generates a JWT for an authenticated user.
   */
  async generateToken(user: any): Promise<TokenDto> {
    const payload = { sub: user.id, email: user.email, tier: user.tier };
    
    const token = this.jwtService.sign(payload);
    const decoded = this.jwtService.decode(token) as any;
    
    return {
      accessToken: token,
      expiresIn: decoded.exp - decoded.iat,
      tokenType: 'Bearer',
      user: {
        id: user.id,
        email: user.email,
        tier: user.tier,
      },
    };
  }

  /**
   * REGISTER: Create a new user with password
   */
  async register(dto: RegisterDto): Promise<TokenDto> {
    const { email, password, firstName, lastName } = dto;

    // 1. Check if user exists via UsersService
    const existingUser = await this.usersService.findByEmail(email);

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // 2. Hash Password
    const hashedPassword = await this.hashPassword(password);

    // 3. Create User via UsersService
    const user = await this.usersService.create({
      email,
      firstName,
      lastName: lastName || '',
      password: hashedPassword,
      tier: SubscriptionTier.FREE,
    });

    // 4. Return Token
    return this.generateToken(user);
  }

  /**
   * LOGIN: Verify email and password
   */
  async login(dto: LoginDto): Promise<TokenDto> {
    const { email, password } = dto;

    // 1. Find User via UsersService
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 2. Check if user has a password (OAuth users might not)
    if (!user.password) {
      throw new UnauthorizedException('Please login with Google or reset your password');
    }

    // 3. Verify Password
    const isMatch = await this.verifyPassword(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 4. Return Token
    return this.generateToken(user);
  }

  /**
   * Handles Google OAuth Login/Registration
   */
  async validateOAuthLogin(profile: any) {
    const { email, firstName, lastName } = profile;

    try {
      let user = await this.usersService.findByEmail(email);

      if (!user) {
        this.logger.log(`Creating new user from OAuth: ${email}`);
        user = await this.usersService.create({
            email,
            firstName,
            lastName,
            password: null, // No password for OAuth
            tier: SubscriptionTier.FREE,
        });
      }

      return user;
    } catch (error) {
      this.logger.error(`OAuth validation error: ${error.message}`);
      throw new InternalServerErrorException('Could not validate OAuth user');
    }
  }

  async sendMagicLink(email: string) {
     return { message: 'Feature temporarily disabled for security upgrades.' };
  }
}