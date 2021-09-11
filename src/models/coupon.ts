import mongoose, { Schema } from 'mongoose'
import { CouponDocument } from '../types'
const { ObjectId } = Schema.Types

const couponSchema = new Schema(
  {
    active: { type: Boolean, default: false },
    amount: { type: Number, default: 0 },
    code: { type: String, required: true },
    color: { type: String },
    info: { type: String },
    maxAmount: { type: Number, default: 0 },
    minimumCartValue: { type: Number, default: 0 },
    msg: { type: String },
    q: { type: String },
    store: { type: ObjectId, ref: 'Store' },
    terms: { type: String },
    text: { type: String },
    type: { type: String, default: 'Discount' },
    validFromDate: { type: Date },
    validToDate: { type: Date },
    value: { type: Number, default: 0 },
  },
  {
    versionKey: false,
    timestamps: true,
  }
)

couponSchema.pre('save', async function (this: CouponDocument) {
  this.q = this.code ? this.code + ' ' : ''
  this.q += this.value ? this.value + ' ' : ''
  this.q += this.type ? this.type.toLowerCase() + ' ' : ''
  this.q += this.info ? this.info.toLowerCase() + ' ' : ''
  this.q += this.msg ? this.msg.toLowerCase() + ' ' : ''
  this.q += this.text ? this.text.toLowerCase() + ' ' : ''
  this.q += this.terms ? this.terms.toLowerCase() + ' ' : ''
  this.q += this.color ? this.color.toLowerCase() + ' ' : ''
  this.q += this.active ? this.active + ' ' : ''
  this.q = this.q.trim()
})
couponSchema.index({
  '$**': 'text',
})
export const Coupon = mongoose.model<CouponDocument>('Coupon', couponSchema)
