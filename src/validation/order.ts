import { Joi } from './joi'

export const orderSchema = Joi.object({
  body: Joi.string().required().label('Body'),
})
