import { Document } from 'mongoose'
import { StoreDocument, UserDocument } from '.'

export interface UnitDocument extends Document {
  active: boolean
  featured: boolean
  img: string
  info: string
  name: string
  q: string
  slug: string
  store: StoreDocument['_id']
  user: UserDocument['_id']
}
