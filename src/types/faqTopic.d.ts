import { Document } from 'mongoose'
import { UserDocument } from './'

export interface FaqTopicDocument extends Document {
  // slug: string
  active: boolean
  for: string
  name: string
  q: string
  uid: UserDocument['_id']
}
