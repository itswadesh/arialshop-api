import { Document } from 'mongoose'
import { UserDocument } from './user'

export interface ShippingMethodDocument extends Document {
  amount: number //rate per order
  carrierName: string
  maxWeight: number
  method: string //"Conditional free shipping"
  minWeight: number
  shippingNameAtCheckout: string
  tableBasedOn: string
  user: UserDocument['_id']
}
