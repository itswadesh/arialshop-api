import { Document } from 'mongoose'
import { StoreDocument } from '.'

export interface CustomerMessageDocument extends Document {
  name: string
  email: string
  message: string
  store: StoreDocument['_id']
}
