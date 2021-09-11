import { Options } from 'nodemailer/lib/smtp-connection'
import { IN_PROD, APP_HOSTNAME } from './app'
const sg = require('nodemailer-sendgrid-transport')

// const {
//   SMTP_HOST = 'smtp.mailtrap.io',
//   SMTP_PORT = 25,
//   SMTP_USERNAME = 'dffdc324953b20',
//   SMTP_PASSWORD = '38e6062046547b'
// } = process.env

// export const SMTP_OPTIONS: Options = {
//   host: SMTP_HOST,
//   port: +SMTP_PORT,
//   secure: IN_PROD,
//   auth: {
//     user: SMTP_USERNAME,
//     pass: SMTP_PASSWORD
//   }
// }

export const MAIL_FROM = `noreply@litekart.in`
export const DOMAIN_NAME = `litekart.in`
export const { SENDGRID_API_KEY } = process.env
const options = { auth: { api_key: SENDGRID_API_KEY } }
export const SMTP_OPTIONS: Options = sg(options)
