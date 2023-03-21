import {
  IsEmail,
  IsOptional,
  IsString,
  IsStrongPassword,
} from 'class-validator'
export class ForgotPasswordDto {
  @IsEmail()
  email: string

  @IsStrongPassword()
  newPassword: string

  @IsString()
  newPasswordToken: string

  @IsStrongPassword()
  @IsOptional()
  currentPassword: string
}
