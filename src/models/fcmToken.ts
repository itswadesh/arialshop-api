import mongoose, { Schema } from 'mongoose'
import { FcmTokenDocument } from '../types'
const { ObjectId } = Schema.Types

export const fcmTokenSchema = new Schema(
  {
    active: { type: Boolean, default: true },
    device_id: { type: String },
    platform: { type: String }, // web,mobile
    sId: { type: String, required: true }, //user type ,(guest/loggedIn)
    token: { type: String, required: true },
    user_type: { type: String }, //user type ,(guest/loggedIn)
    user: { type: ObjectId, ref: 'User' },
  },
  {
    versionKey: false,
    timestamps: true,
  }
)

fcmTokenSchema.index({
  '$**': 'text',
})
export const FcmToken = mongoose.model<FcmTokenDocument>(
  'FcmToken',
  fcmTokenSchema
)
