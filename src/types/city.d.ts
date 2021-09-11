import { Document } from 'mongoose'
import { UserDocument } from './'

export interface CityDocument extends Document {
  active: boolean
  lat: number
  lng: number
  name: string
  q: string
  slug: string
  user: UserDocument['_id']
}
