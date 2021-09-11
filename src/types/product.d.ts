import { Document } from 'mongoose'
import {
  BrandDocument,
  CategoryDocument,
  ChannelDocument,
  CollectionDocument,
  ColorDocument,
  FeatureDocument,
  OptionDocument,
  SizeDocument,
  StoreDocument,
  UserDocument,
  VariantDocument,
} from './'

export interface ProductDocument extends Document {
  active: boolean
  ageMax: number
  ageMin: number
  ageUnit: string
  approved: boolean
  articleCode: string
  assorted: string
  availability: string
  barcode: string
  batchNo: string
  brand: BrandDocument['_id']
  categories: [CategoryDocument['_id']]
  category: CategoryDocument['_id']
  categoryPool: [CategoryDocument['_id']]
  cgst: number
  channels: [ChannelDocument['_id']]
  city: string
  collections: [CollectionDocument['_id']]
  color: ColorDocument['_id']
  colorGroup: ProductDocument['_id']
  condition: string
  countryOfOrigin: string
  currency: string
  daily: boolean
  deliveryDays: number
  demo: boolean
  description: string
  eanNo: string
  enableZips: boolean
  expiryDate: string
  featured: boolean
  features: [FeatureDocument['_id']]
  files: [string]
  gender: string
  googleMerchantProductId: string
  group: string
  gtin: string
  height: number
  hot: boolean
  hsn: string
  igst: number
  images: [string]
  img: string
  info: string
  itemId: string
  keyFeatures: [string]
  keywords: string
  keywordsA: string[]
  length: number
  link: string
  manufacturer: string
  metaDescription: string
  mfgDate: string
  mrp: number
  discount: number
  name: string
  new: boolean
  options: [OptionDocument['_id']]
  parentBrand: BrandDocument['_id']
  parentCategory: CategoryDocument['_id']
  pincodes: string
  popularity: number
  position: number
  price: number
  productDetails: [FeatureDocument['_id']]
  productMasterId: string
  q: string
  ratings: number
  recommended: boolean
  relatedProducts: [ProductDocument['_id']]
  replaceAllowed: boolean
  returnAllowed: boolean
  returnValidityInDays: number
  returnInfo: string
  reviews: number
  sale: boolean
  sales: number
  sgst: number
  size: SizeDocument['_id']
  sizechart: string
  sizeGroup: [ProductDocument['_id']]
  sku: string
  slug: string
  sort: number
  specifications: [FeatureDocument['_id']]
  status: string
  stock: number
  store: StoreDocument['_id']
  styleCode: string
  styleId: string
  tax: number
  time: string
  title: string
  trackInventory: boolean
  trending: boolean
  type: string
  unit: string
  variants: [VariantDocument['_id']]
  vendor: UserDocument['_id']
  warranty: string
  weight: number
  width: number
  zips: [string]
}
