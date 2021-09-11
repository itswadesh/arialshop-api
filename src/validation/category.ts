import { Joi } from './joi'

export const categorySchema = Joi.object().keys({
  id: Joi.objectId().required().label('Category ID'),
  name: Joi.string().required().label('Name'),
})
