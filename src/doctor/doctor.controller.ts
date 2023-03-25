import { UserService } from './../user/user.service'
import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common'
import { JwtAuthGuard } from 'src/auth/jwt.auth.guard'
import { DoctorService } from './doctor.service'
import { ApplyDoctorDto } from './dto/apply-doctor.dto'

@Controller('doctors')
export class DoctorController {
  constructor(
    private readonly doctorService: DoctorService,
    private readonly userService: UserService
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('apply-doctor')
  async applyDoctorAccount(@Body() applyDoctorDto: ApplyDoctorDto) {
    try {
      const applyDoctor = await this.doctorService.applyDoctorAccount(
        applyDoctorDto
      )
      const notification = {
        type: 'new-doctor-request',
        message: `${applyDoctor.firstName} ${applyDoctor.lastName} has applied for a doctor account`,
        data: {
          doctorId: applyDoctor._id,
          userId: applyDoctor.userId,
          name: applyDoctor.firstName + ' ' + applyDoctor.lastName,
        },
      }
      await this.userService.updateAdminNotifications(notification)
      return {
        data: {
          message: 'You have successully applied to a doctor account!',
        },
      }
    } catch (error) {
      console.error(error)
      throw new HttpException(
        'Something went Wrong',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }
}
