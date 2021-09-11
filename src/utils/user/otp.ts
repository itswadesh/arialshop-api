import { UserInputError } from 'apollo-server-errors'
import { Setting } from '../../models'
import { insertServiceBusQueue, getServiceBusQueue, sms } from '..'
import { GET_OTP_SMS_TEMPLATE, SMS_QUEUE_NAME } from '../../config'
import { otpServiceBusHook } from '../hooks'

export const generateOTP = () => {
  const otp = Math.floor(1000 + Math.random() * 9000)
  return otp
}
export const requestOTP = async (phone: string, otp: number) => {
  const settings: any = await Setting.findOne({}).exec()
  if (!settings || !settings.sms.enabled) return
  // const msg = GET_OTP_SMS_TEMPLATE(otp, settings.sms.AUTO_VERIFICATION_ID)
  // console.log('OTP:: ', msg)
  //azure serviceBus Queue
  await otpServiceBusHook(phone, otp)
  //send message
  const msg = `<#> Hi. ${otp} is your OTP to login to ${settings.websiteName} - ${settings.sms.AUTO_VERIFICATION_ID}`
  sms({ phone, msg, otp })
}
