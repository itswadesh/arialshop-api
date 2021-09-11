import { Document } from 'mongoose'
import { StateDocument, UserDocument } from '.'

export interface CountryDocument extends Document {
  // slug: string
  active: boolean
  code: string
  flag: string
  img: string
  lang: string
  name: string
  q: string
  sort: number
  states: [StateDocument['_id']]
  value: string
}
