import {
  IsString,
  IsEmail,
  IsOptional,
  IsStrongPassword,
  IsNotEmpty,
} from 'class-validator'

export class UserRegisterDto {
  @IsString()
  @IsNotEmpty()
  firstName: string

  @IsString()
  @IsNotEmpty()
  lastName: string

  @IsEmail()
  email: string

  @IsStrongPassword()
  password: string

  @IsOptional()
  address: string
}
