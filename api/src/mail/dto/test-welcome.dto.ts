import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class TestWelcomeDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  firstName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  lastName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  businessName: string;
}
