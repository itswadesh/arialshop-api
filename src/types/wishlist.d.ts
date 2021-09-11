import { Document } from 'mongoose'
import {
  ProductDocument,
  StoreDocument,
  UserDocument,
  VariantDocument,
} from './'

export interface WishlistDocument extends Document {
  active: boolean
  product: ProductDocument['_id']
  status: string
  store: StoreDocument['_id']
  user: UserDocument['_id']
  variant: VariantDocument['_id']
}
