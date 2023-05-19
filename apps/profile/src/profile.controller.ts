import { Body, Controller, HttpCode, Post } from "@nestjs/common";
import { ApiCreatedResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { ProfileService } from './profile.service';
import { ProfileRegistrationDto } from "./dto/profile-registration.dto";

@ApiTags('Профиль')
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @ApiOperation({ summary: 'Создать профиль' })
  @ApiCreatedResponse({ description: 'Профиль успешно создан' })
  @HttpCode(201)
  @Post()
  async createProfileAndUser(@Body() data: ProfileRegistrationDto) {
    return {
      status: 'success',
      profileId: await this.profileService.createProfileAndUser(data)
    };
  }
}
