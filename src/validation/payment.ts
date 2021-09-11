import { Joi } from './joi'

export const paySchema = Joi.object({
  address: Joi.objectId().required().label('User Address'),
})
