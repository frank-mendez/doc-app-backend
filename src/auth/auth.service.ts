import {
  EmailVerification,
  EmailVerificationDocument,
} from './../schemas/emailverification.schema'
import { User, UserDocument } from '../schemas/user.schema'
import { AuthDto } from './dto/auth.dto'
import { JwtService } from '@nestjs/jwt'
import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { UserService } from '../user/user.service'
import * as bcrypt from 'bcryptjs'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import * as nodemailer from 'nodemailer'

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    @InjectModel(EmailVerification.name)
    private readonly emailVerificationModel: Model<EmailVerificationDocument>,
    private jwtService: JwtService
  ) {}

  async validateUser(authDto: AuthDto): Promise<UserDocument> {
    const { username, password } = authDto
    try {
      const user = await this.userService.findOne(username)

      const passwordValid = await bcrypt.compare(password, user.password)

      if (user && passwordValid) {
        return user
      } else {
        throw new HttpException('Invalid Credentials', HttpStatus.FORBIDDEN)
      }
    } catch (error) {
      throw new HttpException('Invalid Credentials', HttpStatus.FORBIDDEN)
    }
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
      await this.emailVerificationModel.findOneAndUpdate(
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
      return true
    }
  }

  async sendEmailVerification(email: string): Promise<boolean> {
    const emailVerfication = await this.emailVerificationModel.findOne({
      email,
    })
    if (emailVerfication && emailVerfication.emailToken) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_ENDPOINT,
        port: Number(process.env.SMTP_PORT),
        secure: true,
        auth: {
          user: process.env.SMTP_USERNAME,
          pass: process.env.SMTP_PASSWORD,
        },
      })

      const mailOptions = {
        from: '"y" <' + process.env.BASE_URL + '>',
        to: email, // list of receivers (separated by ,)
        subject: 'Verify Email',
        text: 'Verify Email',
        html:
          'Hi! <br><br> Thanks for your registration<br><br>' +
          '<a href=' +
          process.env.BASE_URL +
          '/auth/email/verify/' +
          emailVerfication.emailToken +
          '>Click here to activate your account</a>', // html body
      }

      const send = await transporter.sendMail(mailOptions)
    }
    return true
  }
}
