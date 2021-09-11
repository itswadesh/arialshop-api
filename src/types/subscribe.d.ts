import { Document } from 'mongoose'
import { PaymentDocument, SubscriptionDocument, UserDocument } from '.'

export interface SubscribeDocument extends Document {
  amount: number
  amountDue: number
  amountPaid: number
  daysLeft: number
  EndTime: string
  paid: boolean
  payment: PaymentDocument['_id']
  StartTime: string
  subscription: SubscriptionDocument['_id']
  user: UserDocument['_id'] //user who bought it
}
