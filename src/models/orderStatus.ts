import mongoose, { Schema } from 'mongoose'
import { OrderStatusDocument } from '../types'
const { ObjectId } = Schema.Types

const orderStatusSchema = new Schema(
  {
    active: { type: Boolean, default: true },
    courier_name: { type: String },
    event: { type: String, required: true }, //pickked up ,ready to dispatch
    item: { type: ObjectId, ref: 'Product' },
    order: { type: ObjectId, ref: 'Order' },
    tracking_id: { type: String },
    type: { type: String, default: 'order' }, //order or return or replace
    user: { type: ObjectId, ref: 'User' },
  },
  {
    versionKey: false,
    timestamps: true,
  }
)

orderStatusSchema.index({
  '$**': 'text',
})
export const OrderStatus = mongoose.model<OrderStatusDocument>(
  'OrderStatus',
  orderStatusSchema
)
