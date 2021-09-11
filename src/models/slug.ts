import mongoose, { Schema } from 'mongoose'
import { SlugDocument } from '../types'

const { ObjectId } = Schema.Types

const slugSchema = new Schema(
  {
    q: { type: String },
    slug: { type: String },
    store: { type: ObjectId, ref: 'Store' },
    type: { type: String },
    user: { type: ObjectId, ref: 'User' },
  },
  {
    versionKey: false,
    timestamps: true,
  }
)

export const Slug = mongoose.model<SlugDocument>('Slug', slugSchema)
