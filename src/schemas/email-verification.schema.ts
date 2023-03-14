import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

export type EmailVerificationDocument = EmailVerification & Document

@Schema()
export class EmailVerification {
  @Prop({ required: true, unique: true, type: String })
  email: string

  @Prop({ required: true })
  emailToken: string

  @Prop({ required: true, type: Date })
  timestamp: Date
}

export const EmailVerificationSchema =
  SchemaFactory.createForClass(EmailVerification)
