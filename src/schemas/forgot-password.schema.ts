import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

export type ForgotPasswordDocument = ForgotPassword & Document

@Schema()
export class ForgotPassword {
  @Prop({ required: true, unique: true, type: String })
  email: string

  @Prop({ required: true })
  newPasswordToken: string

  @Prop({ required: true, type: Date })
  timestamp: Date
}

export const ForgotPasswordSchema = SchemaFactory.createForClass(ForgotPassword)
