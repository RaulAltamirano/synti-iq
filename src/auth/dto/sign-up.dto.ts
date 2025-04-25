import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { UserProfileType } from 'src/user/types/user-profile.type';

export class SignUpDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password: string;

  @IsNotEmpty()
  @IsString()
  fullName: string;

  @IsNotEmpty()
  profileType: UserProfileType;
}
