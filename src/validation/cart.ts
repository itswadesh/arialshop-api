import { Joi } from './joi'

export const cartSchema = Joi.object({
  pid: Joi.objectId().required().label('Product ID'),
  vid: Joi.objectId().allow('').label('Variant'),
  qty: Joi.number().required().label('Qty'),
  options: Joi.string().allow('').allow(null).label('Options'),
  vendor: Joi.objectId().allow(null).label('Vendor'),
  store: Joi.objectId().allow(null).label('Store'),
  replace: Joi.boolean().label('Replace'),
})
