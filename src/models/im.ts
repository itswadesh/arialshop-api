import mongoose, { Schema } from 'mongoose'
import { InstantMessageDocument } from '../types'
const { ObjectId } = Schema.Types

const schemaOptions = {
  toObject: { getters: true },
  toJSON: { getters: true },
  versionKey: false,
  timestamps: true,
}
const instantMessageSchema = new Schema(
  {
    channel: { type: String, required: true },
    firstName: { type: String },
    lastName: { type: String },
    message: { type: String, required: true }, //con
    uid: { type: String },
    user: { type: ObjectId, ref: 'User', required: true },
  },
  schemaOptions
)
instantMessageSchema.index({
  '$**': 'text',
})
export const InstantMessage = mongoose.model<InstantMessageDocument>(
  'InstantMessage',
  instantMessageSchema
)
