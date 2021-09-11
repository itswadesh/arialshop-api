import { Document } from 'mongoose'

export interface StateDocument extends Document {
  active: boolean
  code: string
  flag: string
  img: string
  lang: string
  name: string
  q: string
  slug: string
  sort: number
  value: string
}
