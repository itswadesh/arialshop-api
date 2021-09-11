import { Document } from 'mongoose'
import { OptionDocument, UserDocument } from './'

export interface OptionValueDocument extends Document {
  active: boolean
  amount: number
  default: boolean
  direction: string
  name: string
  option_id: OptionDocument['_id']
  position: number
  type: string
  user: UserDocument['_id']
}
