import { AuthDto } from './dto/auth.dto';
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { AuthService } from './auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      username: 'username',
      password: 'password',
    });
  }

  async validate(username: string, password: string): Promise<any> {
    const loginDto = new AuthDto();
    loginDto.username = username;
    loginDto.password = password;
    const user = await this.authService.validateUser(loginDto);
    if (!user) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
    return user;
  }
}
