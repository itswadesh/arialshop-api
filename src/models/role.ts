import mongoose, { Schema } from 'mongoose'
import { RoleDocument } from '../types'

const schemaOptions = {
  toObject: { getters: true },
  toJSON: { getters: true },
  versionKey: false,
  timestamps: true,
}
const roleSchema = new Schema(
  {
    active: { type: Boolean, default: true },
    name: { type: String, required: true }, //db level unique applied
    roles: [{ type: String }],
  },
  schemaOptions
)
roleSchema.index({
  '$**': 'text',
})
export const Role = mongoose.model<RoleDocument>('Role', roleSchema)
