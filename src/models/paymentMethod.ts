import mongoose, { Schema } from 'mongoose'
import { PaymentMethodDocument } from '../types'
const { ObjectId } = Schema.Types

const paymentMethodSchema = new Schema(
  {
    active: { type: Boolean, default: true },
    color: { type: String },
    img: { type: String },
    key: { type: String },
    name: { type: String },
    position: { type: Number },
    text: { type: String },
    instructions: { type: String },
    value: { type: String },
    store: { type: ObjectId, ref: 'Store' },
    user: { type: ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
  }
)
paymentMethodSchema.virtual('isError').get(function () {
  // if (this.value === 'Cashfree')
  return false
})
paymentMethodSchema.index({
  '$**': 'text',
})
export const PaymentMethod = mongoose.model<PaymentMethodDocument>(
  'PaymentMethod',
  paymentMethodSchema
)
