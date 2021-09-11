import { Document } from 'mongoose'
import {
  OptionDocument,
  OptionValueDocument,
  ProductDocument,
  StoreDocument,
} from './'

export interface OptionDocument extends Document {
  active: boolean
  categories: [string]
  default_option: OptionDocument['_id']
  info: string
  isFilter: boolean
  key: string
  name: string
  options: [string]
  pid: ProductDocument['_id']
  position: number
  preselect: boolean
  q: string
  required: boolean
  slug: string
  store: StoreDocument['_id']
  type: string
  val: string
  values: [OptionValueDocument['_id']]
}
