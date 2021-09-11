import mongoose, { Schema } from 'mongoose'
import { CartDocument } from '../types'
const { ObjectId } = Schema.Types

const itemSchema = new Schema({
  barcode: { type: String },
  brand: { type: ObjectId, ref: 'Brand' },
  brandName: { type: String },
  img: { type: String },
  mrp: { type: Number },
  name: { type: String },
  options: { type: Object },
  pid: { type: ObjectId, ref: 'Product' },
  price: { type: Number },
  qty: { type: Number },
  shippingCharge: { type: Number, default: 0 },
  subtotal: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  slug: { type: String },
  tax: { type: Number, default: 0 },
  time: { type: String },
  tracking: { type: String },
  uid: { type: ObjectId, ref: 'User' },
  vendor: { type: ObjectId, ref: 'User' },
  vendorFirstName: { type: String },
  vendorLastName: { type: String },
  vendorPhone: { type: String },
  vid: { type: ObjectId, ref: 'Variant' },
})

const cartSchema = new Schema(
  {
    active: { type: Boolean, default: true },
    cart_id: { type: String },
    discount: Object,
    items: [itemSchema],
    offer_total: Number,
    qty: Number,
    shipping: Object,
    store: { type: ObjectId, ref: 'Store' },
    subtotal: Number,
    tax: { type: Number, default: 0 },
    total: Number,
    uid: { type: ObjectId, ref: 'User' },
    vendor: { type: ObjectId, ref: 'User' },
  },
  {
    versionKey: false,
    timestamps: true,
  }
)

cartSchema.index({
  '$**': 'text',
})

export const Cart = mongoose.model<CartDocument>('Cart', cartSchema)
