import { Joi } from './joi'

const name = Joi.string()
  .min(1)
  .max(100)
  .message('must have provided.')
  .required()

const address = Joi.string()
  .min(1)
  .max(300)
  .message('must have provided.')
  .required()

export const storeSchema = Joi.object().keys({
  name,
  // address,
})
