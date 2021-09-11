import { Document } from 'mongoose'
import {
  BrandDocument,
  CouponDocument,
  ProductDocument,
  StoreDocument,
  UserDocument,
} from './'
import { VariantDocument } from './variant'

export interface CartDocument extends Document {
  active: boolean
  body: string
  cart_id: CartDocument['_id']
  discount: CouponDocument['_id']
  items: [CartItemDocument['_id']]
  offer_total: number
  price: number
  qty: number
  shipping: any
  store: StoreDocument['_id']
  subtotal: number
  tax: object
  total: number
  uid: UserDocument['_id']
  vendor: UserDocument['_id']
}

export interface CartItemDocument extends Document {
  brand: BrandDocument['_id']
  brandName: string
  currency: string
  deliveryDays: number
  description: string
  img: string
  name: string
  options: string
  pid: ProductDocument['_id']
  price: number
  qty: number
  shipping: object
  shippingCharge: number
  sku: string
  slug: string
  store: StoreDocument['_id']
  subtotal: number
  tax: number
  total: number
  vendor: UserDocument['_id']
  vendorFirstName: string
  vendorLastName: string
  vendorPhone: string
  vid: VariantDocument['_id']
}
