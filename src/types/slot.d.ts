import { Document } from 'mongoose'
import { StoreDocument, UserDocument } from './'

export interface SlotDocument extends Document {
  active: boolean
  info: string
  name: string
  q: string
  slug: string
  store: StoreDocument['_id']
  uid: UserDocument['_id']
  val: string
}
