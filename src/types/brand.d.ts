import { Document } from 'mongoose'
import { UserDocument, BrandDocument } from '.'

export interface BrandDocument extends Document {
  active: boolean
  banner: string
  brand_id: string
  brandId: string
  facebookUrl: string
  featured: boolean
  img: string
  info: string
  instaUrl: string
  linkedinUrl: string
  meta: string
  metaDescription: string
  metaKeywords: string
  metaTitle: string
  name: string
  parent: BrandDocument['_id']
  position: number
  q: string
  sizechart: string
  slug: string
  store: StoreDocument['_id']
  twitterUrl: string
  uid: UserDocument['_id']
  youtubeUrl: string
}
