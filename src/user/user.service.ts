import { User, UserDocument } from './../schemas/user.schema'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { UserRegisterDto } from './dto/user-register.dto'
import * as bcrypt from 'bcryptjs'

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly model: Model<UserDocument>
  ) {}

  async findAll(): Promise<User[]> {
    return await this.model.find().select({ password: 0 }).exec()
  }

  async findOne(email: string): Promise<UserDocument> {
    return await this.model.findOne({ email }).exec()
  }

  async getUserDetail(id: string): Promise<User> {
    return await this.model.findOne({ id }).select({ password: 0 }).exec()
  }

  async register(userRegisterDto: UserRegisterDto): Promise<User> {
    return await new this.model({
      ...userRegisterDto,
      createdAt: new Date(),
    }).save()
  }

  async delete(id: string): Promise<User> {
    return await this.model.findByIdAndDelete(id).exec()
  }

  async setPassword(email: string, newPassword: string): Promise<boolean> {
    const user = await this.model.findOne({ email }).exec()
    if (user) {
      const salt = await bcrypt.genSalt()
      user.password = await bcrypt.hash(newPassword, salt)
      user.save()

      return true
    }
  }

  async getAdmin(): Promise<UserDocument> {
    return await this.model.findOne({ isAdmin: true })
  }

  async updateAdminNotifications(notification: any): Promise<UserDocument> {
    const admin = await this.model.findOne({ isAdmin: true }).exec()
    const unseenNotifications = admin.unseenNotifications
    unseenNotifications.push(notification)
    const updatedNotifications = await this.model.findByIdAndUpdate(admin._id, {
      unseenNotifications,
    })
    return updatedNotifications
  }

  async getAdminUnseenNotifications(): Promise<any[]> {
    const admin = await this.model.findOne({ isAdmin: true }).exec()
    const unseenNotifications = admin.unseenNotifications
    return unseenNotifications
  }
}
