import { QueryRunner } from 'typeorm';
import { UserProfileType } from '../types/user-profile.type';

export interface IProfileStrategy {
  getProfileType(): UserProfileType;
  createProfile(profileData: any, queryRunner: QueryRunner): Promise<any>;
  validateProfileData(profileData: any): Promise<boolean>;
}
