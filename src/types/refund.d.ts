import { Document } from 'mongoose'

export interface RefundDocument extends Document {
  amount: number
  qty: number
  refundId: string
  message: string
  time: Date
}
