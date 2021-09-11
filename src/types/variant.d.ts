import { Document } from 'mongoose'

export interface VariantDocument extends Document {
  active: boolean
  barcode: string
  color: string
  discount: number
  enableUnitPrice: boolean
  height: number
  id: string
  images: [string]
  img: string
  length: number
  mrp: number
  name: string
  offer: number
  pid: string
  price: number
  q: string
  saleFromDate: string
  saleToDate: string
  sameImages: boolean
  shipping: number
  sku: string
  sort: number
  stock: number
  trackInventory: boolean
  unit: number
  weight: number
  width: number
}
