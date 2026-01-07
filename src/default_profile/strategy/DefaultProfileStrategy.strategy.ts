import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IProfileStrategy } from 'src/user/strategy/IProfileStrategy';
import { UserProfileType } from 'src/user/types/user-profile.type';
import { Repository, QueryRunner } from 'typeorm';
import { DefaultProfile } from '../entities/default_profile.entity';
import { CreateDefaultProfileDto } from '../dto/create-default_profile.dto';

@Injectable()
export class DefaultProfileStrategy implements IProfileStrategy {
  constructor(
    @InjectRepository(DefaultProfile)
    private readonly defaultProfileRepo: Repository<DefaultProfile>,
  ) {}

  getProfileType(): UserProfileType {
    return UserProfileType.DEFAULT;
  }

  async createProfile(
    profileData: CreateDefaultProfileDto,
    queryRunner: QueryRunner,
  ): Promise<DefaultProfile> {
    if (!(await this.validateProfileData(profileData))) {
      throw new BadRequestException('Datos de perfil default inválidos.');
    }

    const profile = this.defaultProfileRepo.create(profileData);
    return await queryRunner.manager.save(DefaultProfile, profile);
  }

  async validateProfileData(profileData: any): Promise<boolean> {
    if (!profileData || typeof profileData !== 'object') return false;

    const { userId } = profileData;
    if (!userId || typeof userId !== 'string') return false;

    return true;
  }
}
