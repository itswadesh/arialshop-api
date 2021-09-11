import { Document } from 'mongoose'
import { StoreDocument, UserDocument } from './'

export interface BlogDocument extends Document {
  active: boolean
  content: string
  excerpt: string
  img: string
  published_at: string
  q: string
  refreshSlug: boolean
  slug: string
  status: string
  store: StoreDocument['_id']
  tag_list: [string]
  title: string
  uid: UserDocument['_id']
}
