import { Document } from 'mongoose'
import { ProductDocument, StoreDocument, UserDocument } from '.'

export interface FeatureDocument extends Document {
  // slug: string
  active: boolean
  name: string
  product: ProductDocument['_id']
  q: string
  store: StoreDocument['_id']
  type: string
  user: UserDocument['_id']
  value: string
}
