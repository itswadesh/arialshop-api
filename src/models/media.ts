import mongoose, { Schema } from 'mongoose'
import { MediaDocument } from '../types'

const { ObjectId } = Schema.Types

const mediaSchema = new Schema(
  {
    active: { type: Boolean, default: true },
    name: { type: String }, // used for single image upload like Logo. helps while deleting
    originalFilename: { type: String },
    path: { type: Object },
    q: { type: String },
    size: { type: String },
    src: { type: String },
    type: { type: String },
    uemail: { type: String },
    uid: { type: ObjectId, ref: 'User' },
    uname: { type: String },
    uphone: { type: String },
    use: { type: String },
  },
  {
    versionKey: false,
    timestamps: true,
  }
)
mediaSchema.index({
  '$**': 'text',
})
export const Media = mongoose.model<MediaDocument>('Media', mediaSchema)
