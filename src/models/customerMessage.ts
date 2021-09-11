import mongoose, { Schema } from 'mongoose'
import { CustomerMessageDocument } from '../types'
const { ObjectId } = Schema.Types

const schemaOptions = {
  toObject: { getters: true },
  toJSON: { getters: true },
  versionKey: false,
  timestamps: true,
}
const customerMessageSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    message: { type: String, required: true },
    store: { type: ObjectId, ref: 'Store' },
  },
  schemaOptions
)
customerMessageSchema.index({
  '$**': 'text',
})
export const CustomerMessage = mongoose.model<CustomerMessageDocument>(
  'CustomerMessage',
  customerMessageSchema
)
