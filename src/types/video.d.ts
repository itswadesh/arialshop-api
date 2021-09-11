import { Document } from 'mongoose'
import { CategoryDocument, UserDocument } from '.'

export interface VideoDocument extends Document {
  active: boolean
  board: CategoryDocument['_id']
  category: string
  chapter: string
  class: string
  comment: string
  description: string
  difficulty: string
  id: string
  img: string
  lang: string
  level: number
  name: string
  slug: string
  sort: number
  status: string
  subject: CategoryDocument['_id']
  title: string
  type: string
  url: string
  user: string
  videoId: string
  views: number
}
