import { AuthService } from './../auth/auth.service'
import { UserService } from './user.service'
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common'
import { UserRegisterDto } from './dto/user-register.dto'
import * as bcrypt from 'bcryptjs'
import { JwtAuthGuard } from '../auth/jwt.auth.guard'
import * as _ from 'lodash'
import { IResponse } from '../types'

@Controller('users')
export class UserController {
  constructor(
    private readonly service: UserService,
    private readonly authService: AuthService
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async index() {
    return await this.service.findAll()
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async find(@Param('id') id: string) {
    return await this.service.findOne(id)
  }

  @UseGuards(JwtAuthGuard)
  @Get('/details/:id')
  async getUser(@Param('id') id: string) {
    return await this.service.getUserDetail(id)
  }

  @UseGuards(JwtAuthGuard)
  @Get('/admin/unseen-notifications')
  async getAdminUnseenNotifications() {
    try {
      return await this.service.getAdminUnseenNotifications()
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/remove-unseen-notification/:id')
  async clearAllUnseenNotifications(@Param('id') id: string) {
    try {
      return await this.service.clearAllUnseenNotifications(id)
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/remove-seen-notification/:id')
  async clearALlSeenNotifications(@Param('id') id: string) {
    try {
      return await this.service.clearALlSeenNotifications(id)
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  @Post()
  async register(@Body() userRegisterDto: UserRegisterDto): Promise<IResponse> {
    const salt = await bcrypt.genSalt()
    const hashedPassword = await bcrypt.hash(userRegisterDto.password, salt)
    userRegisterDto.password = hashedPassword

    try {
      const user = await this.service.register(userRegisterDto)
      if (user) {
        await this.authService.createEmailToken(user.email)
        await this.authService.sendEmailVerification(user.email)
        return {
          data: {
            message: 'Registered. Please verify your account on your email',
            user: _.omit(user, ['password']),
          },
        }
      }
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_ACCEPTABLE)
    }
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return await this.service.delete(id)
  }
}
