import { ForgotPasswordDto } from './dto/forgot-password.dto'
import { UserService } from './../user/user.service'
import { AuthService } from './auth.service'
import {
  Controller,
  Post,
  UseGuards,
  Request,
  Param,
  Get,
  HttpException,
  HttpStatus,
  Body,
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { IResponse } from '../types'
import { ForgotPasswordEmailDto } from './dto/forgot-password-email.dto'

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private readonly userService: UserService
  ) {}

  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Request() req: any) {
    return this.authService.login(req.user)
  }

  @Get('email/verify/:token')
  async verifyEmail(@Param('token') token: string): Promise<IResponse> {
    try {
      const verified = this.authService.verifyEmail(token)
      if (verified) {
        return {
          data: {
            message: 'Congratulations! Your account has been verified',
          },
        }
      }
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  @Get('/email/resend-verification/:email')
  async resendVerifyEmail(@Param('email') email: string): Promise<IResponse> {
    try {
      const resend = await this.authService.sendEmailVerification(email)
      if (resend) {
        return {
          data: {
            message: 'Email Successfully sent',
          },
        }
      }
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  @Post('/email/forgot-password')
  async sendEmailForgotPassword(
    @Body() body: ForgotPasswordEmailDto
  ): Promise<IResponse> {
    const { email } = body
    try {
      const sendEmail = await this.authService.sendEmailForgotPassword(email)
      if (sendEmail) {
        return {
          data: {
            message: 'Request Password Sent',
          },
        }
      }
    } catch (error) {
      throw new HttpException(
        'Reset Password request already sent',
        HttpStatus.CONFLICT
      )
    }
  }

  @Post('/email/reset-password')
  async resetPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto
  ): Promise<IResponse> {
    if (forgotPasswordDto.email && forgotPasswordDto.currentPassword) {
      const isValidPassword = await this.authService.checkPassword(
        forgotPasswordDto.email,
        forgotPasswordDto.currentPassword
      )
      if (isValidPassword) {
        try {
          const updatedPassword = await this.userService.setPassword(
            forgotPasswordDto.email,
            forgotPasswordDto.newPassword
          )
          if (updatedPassword) {
            return {
              data: {
                message: 'Password successfully changed',
              },
            }
          }
        } catch (error) {
          throw new HttpException(
            'Something went wrong',
            HttpStatus.INTERNAL_SERVER_ERROR
          )
        }
      }
    } else if (forgotPasswordDto.newPasswordToken) {
      try {
        const validForgotPassword = await this.authService.getForgotPassword(
          forgotPasswordDto.newPasswordToken
        )
        if (validForgotPassword) {
          const forgotPasswordModel = await this.authService.getForgotPassword(
            forgotPasswordDto.newPasswordToken
          )
          const updatedPassword = await this.userService.setPassword(
            forgotPasswordModel.email,
            forgotPasswordDto.newPassword
          )
          if (updatedPassword) {
            await forgotPasswordModel.remove()
          }
          return {
            data: {
              message: 'Password successfully changed',
            },
          }
        }
      } catch (error) {
        throw new HttpException(
          'Something went wrong',
          HttpStatus.INTERNAL_SERVER_ERROR
        )
      }
    }
  }
}
