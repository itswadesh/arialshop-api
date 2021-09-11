import { Document } from 'mongoose'
import { UserDocument } from '.'

export interface PromotionDocument extends Document {
  action: { type: 'Fixed'; val: '0' }
  active: boolean
  condition: [string]
  description: string
  featured: boolean
  img: string
  name: string
  platform: string
  priority: number
  productCondition: { type: string }
  q: string
  refreshSlug: boolean
  slug: string
  type: string
  uid: UserDocument['_id']
  validFromDate: string
  validToDate: string
}
