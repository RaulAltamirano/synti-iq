import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomerProfile } from './entities/customer_profile.entity';
import { CreateCustomerProfileDto } from './dto/create-customer-profile.dto';
import { UpdateCustomerProfileDto } from './dto/update-customer-profile.dto';

@Injectable()
export class CustomerProfileService {
  constructor(
    @InjectRepository(CustomerProfile)
    private readonly customerProfileRepository: Repository<CustomerProfile>,
  ) {}

  async create(data?: CreateCustomerProfileDto): Promise<CustomerProfile> {
    const customerProfile = this.customerProfileRepository.create(data || {});
    return await this.customerProfileRepository.save(customerProfile);
  }

  async findByUserId(userId: string): Promise<CustomerProfile | null> {
    return null;
  }

  async findById(id: string): Promise<CustomerProfile | null> {
    return await this.customerProfileRepository.findOne({
      where: { id },
      relations: ['subscriptions'],
    });
  }

  async update(id: string, data: UpdateCustomerProfileDto): Promise<CustomerProfile> {
    const customerProfile = await this.findById(id);
    if (!customerProfile) {
      throw new NotFoundException(`CustomerProfile with ID ${id} not found`);
    }

    Object.assign(customerProfile, data);
    return await this.customerProfileRepository.save(customerProfile);
  }

  async delete(id: string): Promise<void> {
    const result = await this.customerProfileRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`CustomerProfile with ID ${id} not found`);
    }
  }
}
