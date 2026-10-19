import { Injectable } from '@nestjs/common';
import { CreateDeliveryProfileInput } from './dto/create-delivery_profile.input';
import { UpdateDeliveryProfileInput } from './dto/update-delivery_profile.input';

@Injectable()
export class DeliveryProfilesService {
  create(createDeliveryProfileInput: CreateDeliveryProfileInput) {
    return 'This action adds a new deliveryProfile';
  }

  findAll() {
    return `This action returns all deliveryProfiles`;
  }

  findOne(id: number) {
    return `This action returns a #${id} deliveryProfile`;
  }

  update(id: number, updateDeliveryProfileInput: UpdateDeliveryProfileInput) {
    return `This action updates a #${id} deliveryProfile`;
  }

  remove(id: number) {
    return `This action removes a #${id} deliveryProfile`;
  }
}
