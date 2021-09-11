import { Joi } from './joi'

export const brandSchema = Joi.object().keys({
  email: Joi.allow('').label('Email'),
  firstName: Joi.allow('').label('First Name'),
  lastName: Joi.allow('').label('Last Name'),
  address: Joi.string().required().label('Brand'),
  town: Joi.allow('').label('Town'),
  district: Joi.allow('').label('District'),
  city: Joi.allow('').label('City'),
  country: Joi.allow('').label('Country'),
  state: Joi.allow('').label('State'),
  coords: Joi.allow('').label('Coords'),
  zip: Joi.allow('').label('Zip'),
  phone: Joi.allow('').label('Phone'),
})
