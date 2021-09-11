import { object } from 'joi'
import mongoose, { Schema } from 'mongoose'
import { ImportDetailDocument } from '../types'
const { ObjectId } = Schema.Types

const schemaOptions = {
  toObject: { getters: true },
  toJSON: { getters: true },
  versionKey: false,
  timestamps: true,
}
const importDetailSchema = new Schema(
  {
    data: { type: Object },
    fileName: { type: String },
    importNo: { type: String, required: true }, // for each import this will be unique
    message: { type: String },
    rawNo: { type: Number, required: true },
    success: { type: Boolean, default: false }, // true: item created or updated ,false : error occured
    totalItems: { type: Number, default: 0 },
    type: { type: String }, // like (category/product/...)
    user: { type: ObjectId, ref: 'User' },
  },
  schemaOptions
)

export const ImportDetail = mongoose.model<ImportDetailDocument>(
  'ImportDetail',
  importDetailSchema
)
