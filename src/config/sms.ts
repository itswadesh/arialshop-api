export const OTP_MAX_RETRY = 6 // Number of OTP retry before long waiting

export const OTP_SHORT_GAP = 30 // Seconds

export const OTP_LONG_GAP = 30 * 60 // 30 Minutes

export const PHONE_MIN_LENGTH = 10 // For India its 10 e.g. 8895092508
export const PHONE_MAX_LENGTH = 14 // For India its 14 e.g. +91-8895092508

export const {
  FAST2SMS_KEY = 'FAST2SMS_KEY',
  FAST2SMS_SENDER_ID = 'FAST2SMS_KEY',
  FAST2SMS_TEMPLATE_ID = 1372,
} = process.env

export const {
  TWILIO_ACCOUNT_SID = 'TWILIO_ACCOUNT_SID',
  TWILIO_AUTH_TOKEN = 'TWILIO_AUTH_TOKEN',
  FROM_TWILIO_PHONE_NUMBER = '+15005550006',
} = process.env

export const {
  SMS_TEXTLOCAL_API_KEY = 'SMS_TEXTLOCAL_API_KEY',
  SMS_TEXTLOCAL_SENDER_ID = 'SMS_TEXTLOCAL_SENDER_ID',
} = process.env

export const {
  SMS_VF_USERNAME = 'SMS_VF_USERNAME',
  SMS_VF_PASSWORD = 'SMS_VF_PASSWORD',
  SMS_VF_SENDER_ID = 'SMS_VF_SENDER_ID',
} = process.env

export const {
  FROM_NEXMO_PHONE_NUMBER = '+15005550006',
  NEXMO_API_KEY = 'NEXMO_API_KEY',
  NEXMO_API_SECRET_KEY = 'NEXMO_API_SECRET_KEY',
} = process.env

export const {
  SMS_AUTHKEY_API_KEY = '000053bafd520000',
  SMS_AUTHKEY_SENDER_ID = 'MISIKI',
  ENTITY_ID = '1201160338581099170',
  DLT_TEMPLATE_ID = '1207161197207623796',
} = process.env

export const GET_OTP_SMS_TEMPLATE = (otp, AUTO_VERIFICATION_ID) =>
  `Hi, ${otp} is your OTP to login to Tablez - ${AUTO_VERIFICATION_ID} Regards, Tablez Food Company`
