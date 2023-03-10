import { UserService } from './user.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UserRegisterDto } from './dto/user-register.dto';
import * as bcrypt from 'bcryptjs';
import { JwtAuthGuard } from '../auth/jwt.auth.guard';

@Controller('users')
export class UserController {
  constructor(private readonly service: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async index() {
    return await this.service.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async find(@Param('id') id: string) {
    return await this.service.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/details/:id')
  async getUser(@Param('id') id: string) {
    return await this.service.getUserDetail(id);
  }

  @Post()
  async create(@Body() userRegisterDto: UserRegisterDto) {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(userRegisterDto.password, salt);
    userRegisterDto.password = hashedPassword;

    try {
      return await this.service.register(userRegisterDto);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_ACCEPTABLE);
    }
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return await this.service.delete(id);
  }
}
