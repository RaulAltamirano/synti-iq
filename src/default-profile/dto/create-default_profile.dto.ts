import { IsUUID, IsOptional, IsObject, IsArray } from 'class-validator';

export class CreateDefaultProfileDto {
  @IsUUID()
  userId: string;

  @IsOptional()
  @IsObject()
  preferences?: {
    language?: string;
    theme?: string;
    notifications?: boolean;
  };

  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  wishlist?: string[];

  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  viewedProducts?: string[];
}
