import { Document } from 'mongoose'
import { StoreDocument, UserDocument } from './'

export interface FaqDocument extends Document {
  active: boolean
  answer: string
  q: string
  question: string
  store: StoreDocument['_id']
  topic: string
  uid: UserDocument['_id']
}
