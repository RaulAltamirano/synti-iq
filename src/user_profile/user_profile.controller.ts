import { Controller } from '@nestjs/common';
import { UserProfileService } from './user_profile.service';

@Controller('user-profile')
export class UserProfileController {
  constructor(private readonly userProfileService: UserProfileService) {}
}
