import { Document } from 'mongoose'
import { StoreDocument } from '.'

export interface ColorDocument extends Document {
  // slug: string
  active: boolean
  color_code: string
  featured: boolean
  info: string
  name: string
  q: string
  store: StoreDocument['_id']
  uid: string
  val: string
  value: string
}
