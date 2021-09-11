import { Document } from 'mongoose'
import { StoreDocument } from '.'

export interface PaymentDocument extends Document {
  amountDue: number
  amountPaid: number
  totalAmountRefunded: number
  captured: boolean
  clientSecret: string
  contact: string
  currency: string
  customerName: string
  description: string
  email: string
  errorCode: string
  errorDescription: string
  fee: number
  invoiceId: string
  notes: string
  orderId: string
  paid: boolean
  paymentGateway: string
  paymentMode: string
  paymentOrderId: string
  q: string
  receipt: string
  referenceId: string
  refundStatus: string
  status: string
  store: StoreDocument['_id']
  tax: number
  txMsg: string
  txTime: string
}
