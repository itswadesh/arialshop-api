import { Document } from 'mongoose'
import { UserDocument } from './user'
import { ProductDocument } from './product'

export interface ChannelDocument extends Document {
  cid: string
  code: string
  ctime: string
  hlsPullUrl: string
  httpPullUrl: string
  img: string
  msg: string
  name: string
  product: ProductDocument['_id']
  products: [ProductDocument['_id']]
  pushUrl: string
  requestId: string
  rtmpPullUrl: string
  scheduleDateTime: Date
  slug: string
  status: string
  title: string
  token: string
  user: UserDocument['_id']
  users: [UserDocument['_id']]
}
