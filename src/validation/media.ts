import { Joi } from './joi'

export const mediaSchema = Joi.object({
  originalFilename: Joi.allow('').label('Filename'),
  src: Joi.allow('').label('Source'),
  path: Joi.allow('').label('Path'),
  size: Joi.allow('').label('Size'),
  type: Joi.allow('').label('Type'),
  name: Joi.allow('').label('Name'),
  use: Joi.allow('').label('user'),
  active: Joi.allow('').label('Active/Inactive'),
})
