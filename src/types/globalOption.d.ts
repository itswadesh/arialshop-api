import { Document } from 'mongoose'
import { GlobalOptionValueDocument, UserDocument } from './'

export interface GlobalOptionDocument extends Document {
  active: boolean
  categories: [string]
  info: string
  isFilter: boolean
  key: string
  name: string
  position: number
  preselect: boolean
  q: string
  required: boolean
  slug: string
  type: string
  user: UserDocument['_id']
  val: string
  values: [GlobalOptionValueDocument['_id']]
}
