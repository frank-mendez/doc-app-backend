import { IsEmail, IsNotEmpty, IsStrongPassword } from 'class-validator'

export class UserLoginDto {
  @IsEmail()
  @IsNotEmpty()
  email: string

  @IsStrongPassword()
  @IsNotEmpty()
  password: string
}
