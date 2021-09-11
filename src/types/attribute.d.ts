import { Document } from 'mongoose'
import { StoreDocument, UserDocument } from './'

export interface AttributeDocument extends Document {
  active: boolean
  category: string
  name: string
  q: string
  show: boolean
  store: StoreDocument['_id']
  user: UserDocument['_id']
}
