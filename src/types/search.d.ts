import { Document } from 'mongoose'
import { StoreDocument } from './'
export interface SearchDocument extends Document {
  popularity: string
  store: StoreDocument['_id']
  text: string
}
