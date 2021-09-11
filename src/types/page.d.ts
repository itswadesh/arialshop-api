import { Document } from 'mongoose'
import { UserDocument } from './'

export interface PageDocument extends Document {
  active: boolean
  content: string
  description: string
  menuTitle: string
  name: string
  q: string
  refreshSlug: boolean
  slug: string
  title: string
  user: UserDocument['_id']
}
