import { Joi } from './joi'

export const addressSchema = Joi.object({
  id: Joi.allow('').label('ID'),
  email: Joi.allow('').label('Email'),
  firstName: Joi.allow('').label('First Name'),
  lastName: Joi.allow('').label('Last Name'),
  address: Joi.string().required().label('Address'),
  town: Joi.allow('').label('Town'),
  district: Joi.allow('').label('District'),
  city: Joi.allow('').label('City'),
  country: Joi.allow('').label('Country'),
  state: Joi.string().required().label('State'),
  zip: Joi.allow('').label('Zip'),
  phone: Joi.allow('').label('Phone'),
})
