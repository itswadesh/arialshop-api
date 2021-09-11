import { Document } from 'mongoose'

export interface PaymentMethodDocument extends Document {
  active: boolean
  color: string
  img: string
  key: string
  name: string
  position: number
  sort: number
  text: string
  value: string
}
