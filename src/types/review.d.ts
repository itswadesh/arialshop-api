import { Document } from 'mongoose'
import {
  ProductDocument,
  StoreDocument,
  UserDocument,
  VariantDocument,
} from './'

export interface ReviewDocument extends Document {
  active: boolean
  message: string
  pid: ProductDocument['_id']
  q: string
  rating: number
  store: StoreDocument['_id']
  user: UserDocument['_id']
  variant: VariantDocument['_id']
  vendor: UserDocument['_id']
  votes: { voters: [UserDocument['_id']] }
}
