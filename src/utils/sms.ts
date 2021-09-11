import request from 'request'
import { Setting } from '../models'
import axios from 'axios'
import fetch from 'node-fetch'
import twilio from 'twilio'
import Nexmo from 'nexmo'
import {
  FAST2SMS_KEY,
  FAST2SMS_SENDER_ID,
  FAST2SMS_TEMPLATE_ID,
  FROM_TWILIO_PHONE_NUMBER,
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  OTP_LONG_GAP,
  OTP_MAX_RETRY,
  OTP_SHORT_GAP,
  SMS_VF_USERNAME,
  SMS_VF_SENDER_ID,
  SMS_VF_PASSWORD,
  NEXMO_API_KEY,
  NEXMO_API_SECRET_KEY,
  FROM_NEXMO_PHONE_NUMBER,
  SMS_TEXTLOCAL_SENDER_ID,
  SMS_TEXTLOCAL_API_KEY,
  SMS_AUTHKEY_API_KEY,
  SMS_AUTHKEY_SENDER_ID,
  ENTITY_ID,
  DLT_TEMPLATE_ID,
} from '../config'

export const sms = async ({ phone, msg, otp }: any) => {
  try {
    const settings = await Setting.findOne({}).exec()
    if (!settings || !settings.sms.enabled) return

    if (settings.sms.provider == 'nexmo') {
      smsNexmo({ phone, msg, otp })
    } else if (settings.sms.provider == 'myvfirst') {
      VFsms({
        phone: phone.replace('+91', ''),
        msg,
      })
    } else if (settings.sms.provider == 'twilio') {
      smsTwilio({ phone, msg, otp })
    } else if (settings.sms.provider == 'textlocal') {
      TextLocal({ phone, msg, otp })
    } else if (settings.sms.provider == 'authkey') {
      smsAuthKey({ phone: phone.replace('+91', ''), msg, otp })
    } else {
      //fast2sms
      fast2Sms({ phone: phone.replace('+91', ''), msg, otp })
    }
  } catch (error) {
    console.error('sms err...', error.toString())
  }
}
export const fast2Sms = async ({ phone, otp }: any) => {
  if (otp) {
    try {
      const smsString = `https://www.fast2sms.com/dev/bulk?authorization=${FAST2SMS_KEY}&sender_id=${FAST2SMS_SENDER_ID}&language=english&route=qt&numbers=${phone}&message=${FAST2SMS_TEMPLATE_ID}&variables= {AA}&variables_values=${otp}`
      fetch(smsString)
      console.log(`${phone} = ${otp}`)
    } catch (error) {
      console.error('sms err...', error.response.data)
    }
  }
}
export const TextLocal = async ({ phone, msg }: any) => {
  try {
    // console.log('calling textlocal')
    if (msg) {
      const postData = {
        apikey: SMS_TEXTLOCAL_API_KEY,
        numbers: phone,
        message: msg,
        sender: SMS_TEXTLOCAL_SENDER_ID,
      }
      const options = {
        method: 'POST',
        url: 'https://api.textlocal.in/send/',
        formData: postData,
      }
      request(options, function (error, response) {
        if (error) throw new Error(error)
        const body = JSON.parse(response.body)
        if (body.status === 'failure')
          console.log('TextLocal Res.........', body)
      })
      // const tlr = await request(options)
      // const body = JSON.stringify(postData)
      // const res = await fetch('https://api.textlocal.in/send/', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'multipart/form-data',
      //   },
      //   body,
      // })
      // console.log('response', res)
      // const smsString = `https://api.textlocal.in/send/?apiKey=${SMS_TEXTLOCAL_API_KEY}&sender=${SMS_TEXTLOCAL_SENDER_ID}&numbers=${phone}&message=${msg}`
      // console.log('TextLocal URL.............', smsString)
      // const tl = fetch(smsString)
      console.log(`${phone} = ${msg}`)
    }
  } catch (error) {
    console.error('sms err...', error.toString())
  }
}

export const smsAuthKey = async ({ phone, msg }: any) => {
  try {
    const options = {
      method: 'GET',
      url: 'https://api.authkey.io/request',
      qs: {
        authkey: SMS_AUTHKEY_API_KEY,
        sms: msg,
        mobile: phone,
        country_code: '91',
        sender: SMS_AUTHKEY_SENDER_ID,
        pe_id: ENTITY_ID,
        template_id: DLT_TEMPLATE_ID,
      },
    }

    request(options, function (error, response, body) {
      if (error) throw new Error(error)

      console.log(body)
    })
  } catch (error) {
    console.error('sms err...', error.toString())
  }
}

export const VFsms = async ({ phone, msg }: any) => {
  try {
    if (msg) {
      const smsString = `https://http.myvfirst.com/smpp/sendsms?username=${SMS_VF_USERNAME}&password=${SMS_VF_PASSWORD}&to=${phone}&from=${SMS_VF_SENDER_ID}&text=${msg}&category=bulk`
      console.log('myvfirst.............', smsString)
      fetch(smsString)
      console.log(`${phone} = ${msg}`)
    }
  } catch (error) {
    console.error('sms err...', error.toString())
  }
}
export const smsTwilio = async ({ phone, msg }: any) => {
  try {
    const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

    const message = client.messages.create({
      body: msg,
      from: FROM_TWILIO_PHONE_NUMBER,
      to: phone,
    })
    // console.log(message.sid)
  } catch (error) {
    console.error('sms err...', error.toString())
  }
}
export const smsNexmo = async ({ phone, msg }: any) => {
  try {
    const nexmo = new Nexmo({
      apiKey: NEXMO_API_KEY,
      apiSecret: NEXMO_API_SECRET_KEY,
    })
    return nexmo.message.sendSms(
      FROM_NEXMO_PHONE_NUMBER,
      phone,
      msg,
      {},
      function (err, res) {
        if (err) {
          console.log('Nexmo Err::: ', err)
        }
        console.log('Nexmo Response:: ', res)
        return res
      }
    )
  } catch (error) {
    console.error('sms err...', error.toString())
  }
}

export const checkOtpAttemp = async (user: any) => {
  // console.log('calling check otp funciton', user)
  if (user.otpAttemp == 0) return
  if (!user.otp_time) return
  //@ts-ignore
  const diffShort: any = Math.floor((new Date() - user.otp_time) * 0.001)
  const diffLong = Math.floor(diffShort)
  console.log('Time differences are', user.otp_time, diffLong, diffShort)
  console.log('Time', OTP_MAX_RETRY, OTP_LONG_GAP, OTP_SHORT_GAP)
  if (diffLong > OTP_LONG_GAP) {
    console.log('trying for otp after 30 min so now otp_sttemp: 0')
    user.otpAttemp = 0
    await user.save()
    return
  }
  if (user.otpAttemp > OTP_MAX_RETRY - 1) {
    if (diffLong > OTP_LONG_GAP) {
      user.otpAttemp = 0
      await user.save()
      return
    } else {
      // console.log('zzzzzzzzzzzzzzzzzz',diffLong , OTP_LONG_GAP,user.otpAttemp, OTP_MAX_RETRY);
      throw new Error(
        `Resend OTP allow after ${Math.round(
          (OTP_LONG_GAP - diffLong) / 60
        )} Minutes`
      )
    }
  } else {
    if (diffShort > OTP_SHORT_GAP) {
      return
    } else {
      throw new Error(
        `Resend OTP allow after ${OTP_SHORT_GAP - diffShort} Seconds`
      )
    }
  }
}
