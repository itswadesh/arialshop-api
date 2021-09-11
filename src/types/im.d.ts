import { Document } from 'mongoose'
import { UserDocument } from './'

export interface InstantMessageDocument extends Document {
  channel: string
  firstName: string
  lastName: string
  message: string
  uid: string
  user: UserDocument['_id']
}
