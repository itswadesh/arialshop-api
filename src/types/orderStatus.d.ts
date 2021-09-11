import { Document } from 'mongoose'
import { OrderDocument, ProductDocument, UserDocument } from './'

export interface OrderStatusDocument extends Document {
  active: boolean
  courier_name: string
  event: string // user for like- item picked up
  item: ProductDocument['_id'] //used for item
  order: OrderDocument['_id']
  tracking_id: string
  type: string
  user: UserDocument['_id']
}
