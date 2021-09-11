import { Document } from 'mongoose'
import {
  BrandDocument,
  CategoryDocument,
  ProductDocument,
  StoreDocument,
} from './'

export interface AutocompleteDocument extends Document {
  brand: BrandDocument['_id']
  category: CategoryDocument['_id']
  img: string
  name: string
  product: ProductDocument['_id']
  store: StoreDocument['_id']
  storeId: String
  type: string
}
