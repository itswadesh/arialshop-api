import mongoose, { Schema } from 'mongoose'
import { RefundDocument } from '../types'

const schemaOptions = {
  toObject: { getters: true },
  toJSON: { getters: true },
  versionKey: false,
  timestamps: true,
}
const refundSchema = new Schema(
  {
    amount: { type: Number, default: 0 },
    qty: { type: Number },
    refundId: { type: String },
    message: { type: String },
    time: { type: Date },
  },
  schemaOptions
)

refundSchema.index({
  '$**': 'text',
})

export const Refund = mongoose.model<RefundDocument>('Refund', refundSchema)
