import {
  ForgotPassword,
  ForgotPasswordSchema,
} from './../schemas/forgot-password.schema'
import { EmailService } from './../email/email.service'
import { AuthService } from './../auth/auth.service'
import {
  EmailVerification,
  EmailVerificationSchema,
} from '../schemas/email-verification.schema'
import { JwtService } from '@nestjs/jwt'
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { User, UserSchema } from 'src/schemas/user.schema'
import { UserService } from './user.service'
import { UserController } from './user.controller'
import { JwtModule } from '@nestjs/jwt/dist'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: EmailVerification.name, schema: EmailVerificationSchema },
      { name: ForgotPassword.name, schema: ForgotPasswordSchema },
    ]),
    JwtModule,
  ],
  providers: [UserService, JwtService, AuthService, EmailService],
  controllers: [UserController],
})
export class UserModule {}
