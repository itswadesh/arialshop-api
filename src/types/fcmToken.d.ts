import { Document } from 'mongoose'
import { UserDocument } from './user'

export interface FcmTokenDocument extends Document {
  active: boolean
  device_id: string
  platform: string
  sId: string
  token: string
  user_type: string
  user: UserDocument['_id']
}
