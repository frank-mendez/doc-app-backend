import { Doctor, DoctorDocument } from './../schemas/doctor.schema'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { ApplyDoctorDto } from './dto/apply-doctor.dto'

@Injectable()
export class DoctorService {
  constructor(
    @InjectModel(Doctor.name) private readonly model: Model<DoctorDocument>
  ) {}

  async applyDoctorAccount(
    applyDoctorDto: ApplyDoctorDto
  ): Promise<DoctorDocument> {
    return await new this.model({
      ...applyDoctorDto,
      createdAt: new Date(),
    }).save()
  }
}
