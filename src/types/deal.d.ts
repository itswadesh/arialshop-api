import { Document } from 'mongoose'
import { ProductDocument, StoreDocument } from '.'

export interface DealDocument extends Document {
  active: boolean
  dealStatus: boolean
  endTime: string
  endTimeISO: Date
  name: string
  onGoing: boolean
  products: [ProductDocument['_id']]
  startTime: string
  startTimeISO: Date
  store: StoreDocument['_id']
}
