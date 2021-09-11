import { Joi } from './joi'

export const pageSchema = Joi.object().keys({
  id: Joi.objectId().required().label('ID'),
  name: Joi.string().required().label('Name'),
})
