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

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    @InjectModel(EmailVerification.name)
    private readonly emailVerificationModel: Model<EmailVerificationDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private jwtService: JwtService,
    private readonly emailService: EmailService
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
          `${passwordValid ? 'Invalid Credentials' : 'Verify account'}`,
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
      const mailOptions = {
        from: 'frankmendezresources@gmail.com',
        to: 'frankmendezwebdev@gmail.com', // list of receivers (separated by ,)
        subject: 'Verify Email',
        text: 'Verify Email',
        html: `Congratulations on registering to ${process.env.COMPANY_NAME}. 
        <br/> <a href='${process.env.BASE_URL}/auth/email/verify/${emailVerfication.emailToken}'>Click here to verify your account </a>`,
      }

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
}
