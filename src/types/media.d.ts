import { Document } from 'mongoose'
import { UserDocument } from './'

export interface MediaDocument extends Document {
  active: boolean
  name: string
  originalFilename: string
  path: object
  q: string
  size: string
  src: string
  type: string
  uemail: string
  uid: UserDocument['_id']
  uname: string
  uphone: string
  use: string
}
