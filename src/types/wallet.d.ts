import { Document } from 'mongoose'
import { UserDocument } from './user'

export interface WalletDocument extends Document {
  amount: number
  balance: number
  direction: string
  referedUser: UserDocument['_id']
  remark: string
  user: UserDocument['_id']
}
