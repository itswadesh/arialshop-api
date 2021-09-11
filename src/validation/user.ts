import { Joi } from './joi'

const phone = Joi.string()
  .min(3)
  .max(13)
  .trim()
  .lowercase()
  .required()
  .label('Phone')

const otp = Joi.string()
  .min(3)
  .max(6)
  .trim()
  .lowercase()
  .required()
  .label('OTP')

const email = Joi.string()
  .email()
  .min(8)
  .max(254)
  .trim()
  .lowercase()
  .required()
  .label('Email')

const firstName = Joi.string().max(100).trim().required().label('First Name')

const lastName = Joi.string().max(100).trim().required().label('Last Name')

const referrer = Joi.allow('').label('Referrer')

const password = Joi.string()
  .min(1)
  .max(100)
  // .regex(/^(?=.*?[a-z])(?=.*?[A-Z])(?=.*?\d).*$/)
  .message(
    'must have at least one lowercase letter, one uppercase letter, and one digit.'
  )
  .required()
  .label('Password')

export const signUp = Joi.object().keys({
  email,
  firstName,
  lastName,
  password,
  referrer,
})

export const signIn = Joi.object().keys({
  email,
  password,
})

export const signInOtp = Joi.object().keys({
  phone,
  otp,
})
