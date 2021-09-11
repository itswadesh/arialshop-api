import mongoose, { Schema } from 'mongoose'
import { SubscribeDocument } from '../types'
const { ObjectId } = Schema.Types

const subscribeSchema = new Schema(
  {
    amount: { type: Number, default: 0 },
    amountDue: { type: Number, default: 0 },
    amountPaid: { type: Number, default: 0 },
    daysLeft: { type: Number, default: 0 },
    EndTime: { type: String },
    EndTimeISO: { type: Date },
    img: { type: String },
    paid: { type: Boolean, default: false },
    payment: { type: ObjectId, ref: 'Payment' },
    StartTime: { type: String }, //subscription started time
    StartTimeISO: { type: Date },
    subscription: { type: ObjectId, ref: 'Subscription' }, //bought subscription subscription
    user: { type: ObjectId, ref: 'User' }, //user who bought it
  },
  {
    versionKey: false,
    timestamps: true,
  }
)

subscribeSchema.index({
  '$**': 'text',
})
export const Subscribe = mongoose.model<SubscribeDocument>(
  'Subscribe',
  subscribeSchema
)
