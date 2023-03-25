import { IsArray, IsNotEmpty, IsNumber, IsString } from 'class-validator'

export class ApplyDoctorDto {
  @IsString()
  @IsNotEmpty()
  firstName: string

  @IsString()
  @IsNotEmpty()
  lastName: string

  @IsString()
  @IsNotEmpty()
  userId: string

  @IsString()
  @IsNotEmpty()
  phoneNumber: string

  @IsString()
  @IsNotEmpty()
  website: string

  @IsString()
  @IsNotEmpty()
  address: string

  @IsString()
  @IsNotEmpty()
  specialization: string

  @IsNumber()
  @IsNotEmpty()
  experience: number

  @IsNumber()
  @IsNotEmpty()
  consultationFee: number

  @IsArray()
  @IsNotEmpty()
  consultationSchedule: string[]
}
