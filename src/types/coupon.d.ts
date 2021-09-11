import { Document } from 'mongoose'
import { StoreDocument } from '.'

export interface CouponDocument extends Document {
  active: boolean
  amount: number
  code: string
  color: string
  info: string
  maxAmount: number
  minimumCartValue: number
  msg: string
  q: string
  store: StoreDocument['_id']
  terms: string
  text: string
  type: string
  validFromDate: Date
  validToDate: Date
  value: number
}
