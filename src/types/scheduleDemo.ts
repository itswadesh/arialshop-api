import { Document } from 'mongoose'
import { UserDocument } from './user'
import { ProductDocument } from './product'

export interface ScheduleDemoDocument extends Document {
  img: string
  product: ProductDocument['_id']
  products: [ProductDocument['_id']]
  scheduleDateTime: Date
  slug: string
  status: string
  title: string
  token: string
  user: UserDocument['_id']
  users: [UserDocument['_id']]
}
