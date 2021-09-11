import { Document } from 'mongoose'
import { ProductDocument, StoreDocument, UserDocument } from '.'

export interface CollectionDocument extends Document {
  active: boolean
  products: [ProductDocument['_id']]
  description: string
  images: [string]
  img: string
  name: string
  q: string
  slug: boolean
  sort: string
  store: StoreDocument['_id']
  type: string
  user: UserDocument['_id']
}
