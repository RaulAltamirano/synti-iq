import { Injectable } from '@nestjs/common';
import { CreateDefaultProfileDto } from './dto/create-default_profile.dto';
import { UpdateDefaultProfileDto } from './dto/update-default_profile.dto';

@Injectable()
export class DefaultProfileService {
  create(createDefaultProfileDto: CreateDefaultProfileDto) {
    return 'This action adds a new defaultProfile';
  }

  findAll() {
    return `This action returns all defaultProfile`;
  }

  findOne(id: number) {
    return `This action returns a #${id} defaultProfile`;
  }

  update(id: number, updateDefaultProfileDto: UpdateDefaultProfileDto) {
    return `This action updates a #${id} defaultProfile`;
  }

  remove(id: number) {
    return `This action removes a #${id} defaultProfile`;
  }
}
