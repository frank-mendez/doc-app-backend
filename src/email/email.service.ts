import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import * as nodemailer from 'nodemailer'
import * as AWS from '@aws-sdk/client-ses'
import { defaultProvider } from '@aws-sdk/credential-provider-node'
import { SendRawEmailCommand } from '@aws-sdk/client-ses'
import Mail from 'nodemailer/lib/mailer'

@Injectable()
export class EmailService {
  async sendEmail(mailOptions: Mail.Options): Promise<boolean> {
    const ses = new AWS.SES({
      region: 'us-east-1',
      credentialDefaultProvider: defaultProvider,
    })

    const transporter = nodemailer.createTransport({
      SES: { ses, aws: { SendRawEmailCommand } },
    })

    try {
      await transporter.sendMail(mailOptions, (err, info) => {
        if (info) {
          return true
        } else if (err) {
          return false
        }
      })
      return true
    } catch (error) {
      throw new HttpException('Something went wrong', HttpStatus.BAD_REQUEST)
    }
  }
}
