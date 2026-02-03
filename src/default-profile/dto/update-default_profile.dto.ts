import { PartialType } from '@nestjs/mapped-types';
import { CreateDefaultProfileDto } from './create-default_profile.dto';

export class UpdateDefaultProfileDto extends PartialType(CreateDefaultProfileDto) {}
