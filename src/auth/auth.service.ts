import { AuthDto } from './dto/auth.dto';
import { JwtService } from '@nestjs/jwt';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(authDto: AuthDto): Promise<any> {
    const { username, password } = authDto;
    try {
      const user = await this.userService.findOne(username);

      const passwordValid = await bcrypt.compare(password, user.password);

      if (user && passwordValid) {
        return user;
      } else {
        throw new HttpException('Invalid Credentials', HttpStatus.FORBIDDEN);
      }
    } catch (error) {
      throw new HttpException('Invalid Credentials', HttpStatus.FORBIDDEN);
    }
  }

  async login(user: any) {
    const payload = {
      email: user.email,
      id: user._id,
      fullName: user.fullName,
    };
    return {
      access_token: this.jwtService.sign(payload),
      ...payload,
    };
  }
}
