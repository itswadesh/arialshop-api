import { Joi } from './joi'

export const couponSchema = Joi.object().keys({
  code: Joi.string().required().label('Coupon code'),
  value: Joi.number().required().min(1).max(1000).label('Coupon value'),
  type: Joi.string().allow('').label('Coupon Type'),
  info: Joi.string().allow('').label('Coupon Info'),
  msg: Joi.string().allow('').label('Coupon Message'),
  text: Joi.allow('').label('Coupon Text'),
  terms: Joi.allow('').label('Coupon Terms'),
  minimumCartValue: Joi.number().allow('').label('Coupon Min Cart Value'),
  maxAmount: Joi.number().allow('').label('Coupon Max Amount'),
  from: Joi.allow('').label('Coupon Valid From'),
  to: Joi.allow('').label('Coupon Valid To'),
  active: Joi.allow('').label('Coupon Status'),
})
