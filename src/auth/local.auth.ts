import { AuthDto } from './dto/auth.dto'
import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { Strategy } from 'passport-local'
import { PassportStrategy } from '@nestjs/passport'
import { AuthService } from './auth.service'
import { UserDocument } from '../schemas/user.schema'

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      username: 'username',
      password: 'password',
    })
  }

  async validate(username: string, password: string): Promise<UserDocument> {
    const validatePayload = new AuthDto()
    validatePayload.username = username
    validatePayload.password = password
    const user = await this.authService.validateUser(validatePayload)
    if (!user) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED)
    }
    return user
  }
}
