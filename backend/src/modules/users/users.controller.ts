import { Controller, Get, Body, Patch, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';
import { JwtAuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/auth.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getProfile(@CurrentUser() user: any) {
    const fullUser = await this.usersService.findById(user.id);
    // Exclude password from response
    const { password, ...result } = fullUser;
    return result;
  }

  @Patch('me')
  async updateProfile(
    @CurrentUser() user: any,
    @Body() dto: UpdateProfileDto,
  ) {
    const updatedUser = await this.usersService.updateProfile(user.id, dto);
    const { password, ...result } = updatedUser;
    return result;
  }

  @Patch('me/preferences')
  async updatePreferences(
    @CurrentUser() user: any,
    @Body() dto: UpdatePreferencesDto,
  ) {
    const updatedUser = await this.usersService.updatePreferences(user.id, dto);
    const { password, ...result } = updatedUser;
    return result;
  }
}