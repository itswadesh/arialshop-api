import { Joi } from './joi'

export const profileSchema = Joi.object({
  id: Joi.allow('').label('ID'),
  email: Joi.allow('').label('Email'),
  firstName: Joi.allow('').label('First Name'),
  lastName: Joi.allow('').label('Last Name'),
  address: Joi.string().required().label('Address'),
  town: Joi.allow('').label('Town'),
  district: Joi.allow('').label('District'),
  city: Joi.allow('').label('City'),
  country: Joi.allow('').label('Country'),
  state: Joi.allow('').label('State'),
  zip: Joi.allow('').label('Zip'),
  phone: Joi.allow('').label('Phone'),
  type: Joi.allow('').label('Type'),
  avatar: Joi.allow('').label('Avatar'),
  banner: Joi.allow('').label('Banner'),
})
