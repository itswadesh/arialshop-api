import { Joi } from './joi'

export const bannerSchema = Joi.object().keys({
  link: Joi.string().allow('').label('Link'),
  img: Joi.number().required().label('Image'),
  heading: Joi.string().allow('').label('Heading'),
  type: Joi.string().required().label('Type'),
  active: Joi.required().label('Banner Status'),
})
