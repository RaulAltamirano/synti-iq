import { BadRequestException, Inject, Injectable, Logger } from '@nestjs/common';
import { IProfileStrategy } from 'src/user/strategy/IProfileStrategy';
import { UserProfileType } from 'src/user/types/user-profile.type';
import { QueryRunner } from 'typeorm';
import { CreateUserDto } from 'src/user/dtos/CreateUserDto';

@Injectable()
export class UserProfileService {
  private readonly logger = new Logger(UserProfileService.name);
  private readonly profileStrategiesMap: Map<UserProfileType, IProfileStrategy>;

  constructor(
    @Inject('PROFILE_STRATEGIES')
    private readonly profileStrategies: IProfileStrategy[],
  ) {
    this.profileStrategiesMap = new Map<UserProfileType, IProfileStrategy>();
    this.profileStrategies.forEach(strategy => {
      this.profileStrategiesMap.set(strategy.getProfileType(), strategy);
    });
  }

  private getProfileStrategy(profileType: UserProfileType): IProfileStrategy {
    const strategy = this.profileStrategiesMap.get(profileType);
    if (!strategy) {
      throw new BadRequestException(`Tipo de perfil no soportado: ${profileType}`);
    }
    return strategy;
  }

  async createUserProfile(
    dto: CreateUserDto,
    userId: string,
    queryRunner: QueryRunner,
  ): Promise<void> {
    const profileStrategy = this.getProfileStrategy(dto.profileType);
    if (!profileStrategy) {
      throw new Error(`No strategy found for profile type: ${dto.profileType}`);
    }

    let profileData = dto.profileData;
    if (!profileData) {
      if (dto.profileType === UserProfileType.DEFAULT) {
        profileData = {};
      } else {
        throw new BadRequestException(
          `profileData is required for profile type: ${dto.profileType}`,
        );
      }
    }

    await profileStrategy.createProfile({ ...profileData, userId }, queryRunner);
  }
}
