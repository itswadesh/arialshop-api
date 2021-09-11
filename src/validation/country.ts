import { Joi } from './joi'

export const countrySchema = Joi.object().keys({
  name: Joi.string().label('Name'),
  value: Joi.allow('').label('Value'),
  code: Joi.allow('').label('Code'),
  img: Joi.string().required().label('Image'),
  flag: Joi.allow('').label('Flag'),
  lang: Joi.allow('').label('Language'),
  sort: Joi.allow('').label('Sort'),
})
