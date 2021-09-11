import { Document } from 'mongoose'

export interface RoleDocument extends Document {
  active: boolean
  name: string
  roles: [string]
}
