import {
  ForgotPassword,
  ForgotPasswordDocument,
} from './../schemas/forgot-password.schema'
import { EmailService } from './../email/email.service'
import {
  EmailVerification,
  EmailVerificationDocument,
} from '../schemas/email-verification.schema'
import { User, UserDocument } from '../schemas/user.schema'
import { AuthDto } from './dto/auth.dto'
import { JwtService } from '@nestjs/jwt'
import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { UserService } from '../user/user.service'
import * as bcrypt from 'bcryptjs'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { v4 as uuid } from 'uuid'

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    @InjectModel(EmailVerification.name)
    private readonly emailVerificationModel: Model<EmailVerificationDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private jwtService: JwtService,
    private readonly emailService: EmailService,
    @InjectModel(ForgotPassword.name)
    private readonly forgotPasswordModel: Model<ForgotPasswordDocument>
  ) {}

  async validateUser(authDto: AuthDto): Promise<UserDocument> {
    const { username, password } = authDto
    const user = await this.userService.findOne(username)
    if (user) {
      const passwordValid = await bcrypt.compare(password, user.password)

      if (passwordValid && user.isEmailVerified) {
        return user
      } else {
        throw new HttpException(
          `${!passwordValid ? 'Invalid Credentials' : 'Verify account'}`,
          HttpStatus.FORBIDDEN
        )
      }
    }

    throw new HttpException('Invalid Credentials', HttpStatus.FORBIDDEN)
  }

  async login(user: UserDocument) {
    const payload = {
      email: user.email,
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      isEmailVerified: user.isEmailVerified,
    }
    return {
      data: {
        access_token: this.jwtService.sign(payload),
        ...payload,
      },
    }
  }

  async createEmailToken(email: string): Promise<boolean> {
    const emailVerification = await this.emailVerificationModel
      .findOne({ email })
      .exec()
    if (
      emailVerification &&
      (new Date().getTime() - emailVerification.timestamp.getTime()) / 60000 <
        15
    ) {
      throw new HttpException(
        'LOGIN.EMAIL_SENT_RECENTLY',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    } else {
      await this.emailVerificationModel
        .findOneAndUpdate(
          { email },
          {
            email: email,
            emailToken: (
              Math.floor(Math.random() * 9000000) + 1000000
            ).toString(), //Generate 7 digits number
            timestamp: new Date(),
          },
          { upsert: true }
        )
        .exec()
      return true
    }
  }

  async sendEmailVerification(email: string): Promise<boolean> {
    const emailVerfication = await this.emailVerificationModel
      .findOne({
        email,
      })
      .exec()
    if (emailVerfication && emailVerfication.emailToken) {
      const user = await this.userService.findOne(emailVerfication.email)
      const mailOptions = {
        from: 'support@frankmendezfullstack.site',
        to: emailVerfication.email, // list of receivers (separated by ,)
        subject: 'Verify Email',
        text: 'Verify Email',
        html: `Hi ${user.firstName}! Congratulations on registering to ${process.env.COMPANY_NAME}. 
        <br/> <a href='${process.env.REACT_URL}/email/verify/${emailVerfication.emailToken}'>Click here to verify your account </a>`,
      }

      //NOTE: Frontend should call /auth/email/verify/${emailVerfication.emailToken} to verify email

      try {
        const send = await this.emailService.sendEmail(mailOptions)
        return send
      } catch (error) {
        throw new HttpException('Something went wrong', HttpStatus.BAD_REQUEST)
      }
    } else {
      throw new HttpException('Email not found', HttpStatus.NOT_FOUND)
    }
  }

  async verifyEmail(token: string): Promise<boolean> {
    const emailVerify = await this.emailVerificationModel
      .findOne({ emailToken: token })
      .exec()
    if (emailVerify && emailVerify.email) {
      const user = await this.userModel
        .findOne({ email: emailVerify.email })
        .exec()
      if (user) {
        user.isEmailVerified = true
        const savedUser = await user.save()
        if (savedUser) {
          await emailVerify.remove()
          return true
        }
      }
    }
  }

  async createForgotPasswordToken(
    email: string
  ): Promise<ForgotPasswordDocument> {
    const forgotPassword = await this.forgotPasswordModel.findOne({ email })
    if (
      forgotPassword &&
      (new Date().getTime() - forgotPassword.timestamp.getTime()) / 60000 < 15
    ) {
      throw new Error('Forgot password email was already sent')
    } else {
      const saveForgotPassword = await new this.forgotPasswordModel({
        email: email,
        newPasswordToken: uuid(),
        timestamp: new Date(),
      }).save()

      return saveForgotPassword
    }
  }

  async sendEmailForgotPassword(email: string): Promise<boolean> {
    const user = await this.userService.findOne(email)
    const tokenModel = await this.createForgotPasswordToken(email)
    if (tokenModel && tokenModel.newPasswordToken) {
      const mailOptions = {
        from: 'support@frankmendezfullstack.site',
        to: tokenModel.email, // list of receivers (separated by ,)
        subject: 'Forgot Password',
        text: 'Forgot Password',
        html: `Hi ${user.firstName}!<br /> You requested to reset your forgotten password. 
        <br/> <a href='${process.env.REACT_URL}/reset-password/${tokenModel.newPasswordToken}'>Click here to reset your password </a>`,
      }

      //NOTE: Frontend should call the endpoint /auth/email/reset-password/${tokenModel.newPasswordToken}

      const send = await this.emailService.sendEmail(mailOptions)
      return send
    }
  }

  async getForgotPassword(
    newPasswordToken: string
  ): Promise<ForgotPasswordDocument> {
    return await this.forgotPasswordModel.findOne({ newPasswordToken })
  }

  async checkPassword(email: string, password: string) {
    const userFromDb = await this.userModel.findOne({ email: email })
    if (!userFromDb)
      throw new HttpException('LOGIN.USER_NOT_FOUND', HttpStatus.NOT_FOUND)

    return await bcrypt.compare(password, userFromDb.password)
  }
}
