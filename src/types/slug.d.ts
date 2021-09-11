import { Document } from 'mongoose'
import { StoreDocument, UserDocument } from './'

export interface SlugDocument extends Document {
  q: string
  slug: string
  store: StoreDocument['_id']
  type: string
  user: UserDocument['_id']
}
