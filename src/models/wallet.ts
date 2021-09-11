import mongoose, { Schema } from 'mongoose'
import { WalletDocument } from '../types'
const { ObjectId } = Schema.Types

const schemaOptions = {
  toObject: { getters: true },
  toJSON: { getters: true },
  versionKey: false,
  timestamps: true,
}
const walletSchema = new Schema(
  {
    amount: { type: Number, required: true },
    balance: { type: Number, default: 0, required: true },
    direction: { type: String, required: true },
    referedUser: { type: ObjectId, ref: 'User' },
    remark: { type: String, required: true },
    user: { type: ObjectId, ref: 'User' },
  },
  schemaOptions
)

export const Wallet = mongoose.model<WalletDocument>('Wallet', walletSchema)
