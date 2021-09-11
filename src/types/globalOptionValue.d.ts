import { Document } from 'mongoose'
import { GlobalOptionDocument, UserDocument } from './'

export interface GlobalOptionValueDocument extends Document {
  active: boolean
  default: boolean
  global_option_id: GlobalOptionDocument['_id']
  name: string
  position: number
  user: UserDocument['_id']
}
