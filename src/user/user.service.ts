import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/schemas/user.schema';
import { UserRegisterDto } from './dto/user-register.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly model: Model<UserDocument>,
  ) {}

  async findAll(): Promise<User[]> {
    return await this.model.find().select({ password: 0 }).exec();
  }

  async findOne(email: string): Promise<User> {
    return await this.model.findOne({ email }).exec();
  }

  async getUserDetail(id: string): Promise<User> {
    return await this.model.findOne({ id }).select({ password: 0 }).exec();
  }

  async register(userRegisterDto: UserRegisterDto): Promise<User> {
    return await new this.model({
      ...userRegisterDto,
      createdAt: new Date(),
    }).save();
  }

  async delete(id: string): Promise<User> {
    return await this.model.findByIdAndDelete(id).exec();
  }
}
