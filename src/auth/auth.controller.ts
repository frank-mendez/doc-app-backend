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

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Request() req: any) {
    return this.authService.login(req.user)
  }

  @Get('email/verify/:token')
  async verifyEmail(@Param('token') token: string) {
    try {
      return this.authService.verifyEmail(token)
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
}
