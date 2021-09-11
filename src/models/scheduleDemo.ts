import mongoose, { Schema } from 'mongoose'
import { ScheduleDemoDocument } from '../types'
const { ObjectId } = Schema.Types

const schemaOptions = {
  toObject: { getters: true },
  toJSON: { getters: true },
  versionKey: false,
  timestamps: true,
}
const scheduleDemoSchema = new Schema(
  {
    img: { type: String },
    product: { type: ObjectId, ref: 'Product' },
    products: [{ type: ObjectId, ref: 'Product' }],
    scheduleDateTime: { type: Date, required: true },
    slug: { type: String },
    status: { type: String },
    title: { type: String, required: true },
    token: { type: String },
    user: { type: ObjectId, ref: 'User' },
    users: [{ type: ObjectId, ref: 'User' }],
  },
  schemaOptions
)
scheduleDemoSchema.index({
  '$**': 'text',
})
export const ScheduleDemo = mongoose.model<ScheduleDemoDocument>(
  'ScheduleDemo',
  scheduleDemoSchema
)
