import mongoose, { Schema } from 'mongoose'
import { ShippingMethodDocument } from '../types'
const { ObjectId } = Schema.Types

const schemaOptions = {
  toObject: { getters: true },
  toJSON: { getters: true },
  versionKey: false,
  timestamps: true,
}
const shippingMethodSchema = new Schema(
  {
    amount: { type: Number, default: 0 }, //rate per order
    carrierName: { type: String, required: true },
    maxWeight: { type: Number, default: 0 }, // Shipping rates
    method: { type: String, default: 'Conditional free shipping' },
    minWeight: { type: Number, default: 0 }, // Shipping rates
    shippingNameAtCheckout: { type: String },
    tableBasedOn: { type: String },
    user: { type: ObjectId, ref: 'User' },
  },
  schemaOptions
)

export const ShippingMethod = mongoose.model<ShippingMethodDocument>(
  'ShippingMethod',
  shippingMethodSchema
)
