import { QueryRunner } from 'typeorm';
import { UserProfileType } from '../types/user-profile.type';
// import { UserProfile } from 'src/user_profile/entities/user_profile.entity';

export interface IProfileStrategy {
  getProfileType(): UserProfileType;
  createProfile(profileData: any, queryRunner: QueryRunner): Promise<any>;
  validateProfileData(profileData: any): Promise<boolean>;
}
