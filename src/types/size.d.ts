import { Document } from 'mongoose'
import { StoreDocument } from '.'

export interface SizeDocument extends Document {
  active: boolean
  featured: boolean
  img: string
  info: string
  name: string
  q: string
  slug: string
  store: StoreDocument['_id']
  user: string
}
