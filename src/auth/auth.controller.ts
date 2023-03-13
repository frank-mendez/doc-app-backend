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
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { IResponse } from '../types'

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

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
}
