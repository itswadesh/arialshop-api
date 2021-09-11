import { Document } from 'mongoose'
import {
  AttributeDocument,
  BrandDocument,
  StoreDocument,
  UserDocument,
} from './'

export interface CategoryDocument extends Document {
  active: boolean
  attributes: [AttributeDocument['_id']]
  brand: BrandDocument['_id']
  categoryId: string
  children: [CategoryDocument['_id']]
  count: number
  description: string
  featured: boolean
  img: string
  index: number
  level: number
  megamenu: boolean
  meta: string
  metaDescription: string
  metaKeywords: string
  metaTitle: string
  name: string
  namePath: string
  namePathA: [string]
  parent: CategoryDocument['_id']
  path: string
  pathA: [CategoryDocument['_id']]
  pid: string
  position: number
  q: string
  refreshSlug: boolean
  shopbycategory: boolean
  sizechart: string
  slug: string
  slugPath: string
  slugPathA: [string]
  store: StoreDocument['_id']
  user: UserDocument['_id']
}
