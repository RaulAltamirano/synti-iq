import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryRunner } from 'typeorm';
import { UserProfileType } from '../../user/types/user-profile.type';
import { IProfileStrategy } from '../../user/strategy/IProfileStrategy';
import { CashierProfile } from 'src/cashier_profile/entities/cashier_profile.entity';
import { CreateCashierProfileInput } from 'src/cashier_profile/dto/create-cashier_profile.input';
import { validate } from 'class-validator';
import { Store } from 'src/store/entities/store.entity';

@Injectable()
export class CashierProfileStrategy implements IProfileStrategy {
  private readonly logger = new Logger(CashierProfileStrategy.name);

  constructor(
    @InjectRepository(CashierProfile)
    private readonly cashierProfileRepo: Repository<CashierProfile>,
  ) {}

  getProfileType(): UserProfileType {
    return UserProfileType.CASHIER;
  }

  async createProfile(
    profileData: CreateCashierProfileInput,
    queryRunner: QueryRunner,
  ): Promise<any> {
    if (!(await this.validateProfileData(profileData))) {
      throw new BadRequestException('Datos de perfil de cajero inválidos.');
    }
    const { storeId } = profileData;

    const store = await queryRunner.manager.findOne(Store, {
      where: { id: storeId },
    });

    if (!store) {
      throw new NotFoundException(`Tienda con ID ${storeId} no encontrada.`);
    }

    const profile = this.cashierProfileRepo.create({
      ...profileData,
      store,
    });

    return await queryRunner.manager.save(CashierProfile, profile);
  }

  async validateProfileData(profileData: CreateCashierProfileInput): Promise<boolean> {
    if (!profileData || typeof profileData !== 'object') return false;

    const errors = await validate(profileData);
    return errors.length === 0;
  }
}
