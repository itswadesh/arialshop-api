import { Document } from 'mongoose'
import { UserDocument } from './'

export interface ImportDetailDocument extends Document {
  data: object
  fileName: string
  importNo: string
  message: string
  rawNo: number
  success: boolean
  totalItems: number
  type: string
  user: UserDocument['_id']
}
