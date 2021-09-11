import { Document } from 'mongoose'
import {
  AddressDocument,
  CartDocument,
  OrderItemDocument,
  PaymentDocument,
  ProductDocument,
  StoreDocument,
  UserDocument,
} from './'

export interface OrderDocument extends Document {
  address: {
    active: boolean
    address: string
    city: string
    company: string
    coords: { lat: number; lng: number }
    country: string
    deliveryInstructions: string
    district: string
    email: string
    firstName: string
    isResidential: boolean
    lastName: string
    lat: number
    lng: number
    phone: string
    state: string
    town: string
    uid: UserDocument['_id']
    zip: number
  }
  amount: {
    currency: string
    discount: number
    exchangeRate: number
    offer: any
    qty: number
    shipping: number
    subtotal: number
    tax: number
    total: number
  }
  vendor: {
    store: string
    id: UserDocument['_id']
  }
  paymentId: string
  paid: boolean
  amountDue: number
  amountPaid: number
  cancellationComment: string
  cancellationReason: string
  cartId: CartDocument['_id']
  comment: string
  delivery: object
  items: [OrderItemDocument['_id']]
  orderItems: [OrderItemDocument['_id']]
  orderNo: string
  payment: PaymentDocument['_id']
  paymentCurrency: string
  paymentGateway: string
  paymentMode: string
  paymentMsg: string
  paymentOrderId: string
  paymentReferenceId: string
  paymentStatus: string
  paymentTime: string
  paySuccess: number
  returnComment: string
  reviewed: boolean
  status: string
  store: StoreDocument['_id']
  totalAmountRefunded: number
  user: UserDocument['_id']
  userEmail: string
  userPhone: string
  createdAt: string
  updatedAt: string
}
