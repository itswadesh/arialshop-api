import { Joi } from './joi'

export const productSchema = Joi.object().keys({
  id: Joi.objectId().allow('').label('Product ID'),
  name: Joi.string().required().max(500).label('Product Name'),
  description: Joi.allow('').label('Product Description'),
  price: Joi.number().required().min(1).label('Price'),
  stock: Joi.number().required().min(0).label('Quantity'),
  img: Joi.allow(''),
  vendor: Joi.objectId().required().label('Vendor mandatory'),
  time: Joi.allow(''),
  category: Joi.allow(''),
  city: Joi.string().required().max(500).label('City'),
})
