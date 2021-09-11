import { Document } from 'mongoose'
import { StoreDocument } from '.'

export interface BannerDocument extends Document {
  active: boolean
  demo: boolean
  groupId: string
  groupTitle: string
  heading: string
  img: string
  link: string
  pageId: string
  pageType: string
  q: string
  sort: number
  store: StoreDocument['_id']
  type: string
}
