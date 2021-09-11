import { Document } from 'mongoose'
import { ProductDocument, UserDocument } from '.'

export interface DiscountDocument extends Document {
  active: boolean
  amount: number
  applyOn: string
  description: string
  img: string
  name: string
  q: string
  ruleType: string //Product based or Order based
  slug: string
  type: string //Flat or Percentage
  // In case of advance settings
  maximumUsage: number
  startDate: string
  endDate: string
  numberOfTimeUsed: number
  seller: UserDocument['_id']
}
