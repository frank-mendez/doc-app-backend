import * as nodemailer from 'nodemailer'
import { SendRawEmailCommand, SES } from '@aws-sdk/client-ses'
import { sendEmail } from './helper'

jest.mock('nodemailer')

describe('Test sendEmail function', () => {
  const mailOptionsMock = {
    from: 'myemail@test.com',
    to: 'myfriend@test.com',
    subject: 'Hello Friend!',
    text: 'Hi There! this is a test email.',
  }

  test('Should return true if message id returned', async () => {
    const mockTransport = {
      sendMail: jest
        .fn()
        .mockImplementation(() => Promise.resolve({ messageId: '123' })),
    }

    nodemailer.createTransport.mockReturnValue(mockTransport)
    const actualResult = await sendEmail(mailOptionsMock)
    expect(actualResult).toBe(true)
  })

  test('Should return false if there is an error', async () => {
    const mockTransport = {
      sendMail: jest.fn().mockImplementation(() => Promise.reject()),
    }

    nodemailer.createTransport.mockReturnValue(mockTransport)
    const actualResult = await sendEmail(mailOptionsMock)
    expect(actualResult).toBe(false)
  })
})
