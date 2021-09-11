import { Joi } from './joi'

export const ifImage = Joi.object({
  filename: Joi.string().required(),
  mimetype: Joi.string()
    .regex(/image\/(gif|jpg|jpeg|tiff|png)$/i)
    .message('Not a valid image')
    .required(),
  encoding: Joi.string().required(),
})
