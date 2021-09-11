import mongoose, { Schema } from 'mongoose'
import { DealDocument } from '../types'
const { ObjectId } = Schema.Types

const schemaOptions = {
  versionKey: false,
  timestamps: true,
}

const dealSchema = new mongoose.Schema(
  {
    active: { type: Boolean, default: false },
    dealStatus: { type: Boolean, default: false },
    endTime: { type: String },
    endTimeISO: { type: Date },
    name: { type: String },
    img: { type: String },
    onGoing: { type: Boolean, default: false },
    products: [{ type: ObjectId, ref: 'Product' }],
    startTime: { type: String },
    startTimeISO: { type: Date },
    store: { type: ObjectId, ref: 'Store' },
  },
  schemaOptions
)

dealSchema.index({
  '$**': 'text',
})
export const Deal = mongoose.model<DealDocument>('Deal', dealSchema)
