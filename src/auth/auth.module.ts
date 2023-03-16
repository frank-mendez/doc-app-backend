import {
  ForgotPassword,
  ForgotPasswordSchema,
} from './../schemas/forgot-password.schema'
import { EmailService } from './../email/email.service'
import {
  EmailVerification,
  EmailVerificationSchema,
} from '../schemas/email-verification.schema'
import { PassportModule } from '@nestjs/passport'
import { User, UserSchema } from 'src/schemas/user.schema'
import { LocalStrategy } from './local.auth'
import { UserService } from './../user/user.service'
import { AuthService } from './auth.service'
import { JwtModule } from '@nestjs/jwt'
import { Module } from '@nestjs/common'
import { UserModule } from '../user/user.module'
import { AuthController } from './auth.controller'
import { MongooseModule } from '@nestjs/mongoose'
import { ConfigModule } from '@nestjs/config'
import * as dotenv from 'dotenv'
import { JwtStrategy } from './jwt.auth'
dotenv.config()

@Module({
  imports: [
    ConfigModule,
    UserModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: EmailVerification.name, schema: EmailVerificationSchema },
      { name: ForgotPassword.name, schema: ForgotPasswordSchema },
    ]),
  ],
  providers: [
    AuthService,
    UserService,
    LocalStrategy,
    JwtStrategy,
    EmailService,
  ],
  exports: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
