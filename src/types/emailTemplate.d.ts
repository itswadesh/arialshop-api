import { Document } from 'mongoose'
import { StoreDocument, UserDocument } from './'

export interface EmailTemplateDocument extends Document {
  active: boolean
  content: string
  description: string
  id: string
  link: string
  name: string
  store: StoreDocument['_id']
  title: string
  user: UserDocument['_id']
}
