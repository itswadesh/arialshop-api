import { Document } from 'mongoose'
import { CategoryDocument, ProductDocument, BrandDocument } from './'

export interface KeywordDocument extends Document {
  active: boolean
  brand: BrandDocument['_id']
  category: CategoryDocument['_id']
  name: string
  product: ProductDocument['_id']
}
