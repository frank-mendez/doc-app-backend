import { DoctorSchema } from './../schemas/doctor.schema'
import { MongooseModule } from '@nestjs/mongoose'
import { Module } from '@nestjs/common'
import { DoctorService } from './doctor.service'
import { DoctorController } from './doctor.controller'
import { Doctor } from 'src/schemas/doctor.schema'
import { UserService } from 'src/user/user.service'
import { UserModule } from 'src/user/user.module'
import { ConfigModule } from '@nestjs/config'
import { User, UserSchema } from 'src/schemas/user.schema'

@Module({
  imports: [
    ConfigModule,
    UserModule,
    MongooseModule.forFeature([
      {
        name: Doctor.name,
        schema: DoctorSchema,
      },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  providers: [DoctorService, UserService],
  controllers: [DoctorController],
})
export class DoctorModule {}
