import mongoose, { Schema } from 'mongoose'
import { WishlistDocument } from '../types'
const { ObjectId } = Schema.Types

const wishlistSchema = new mongoose.Schema(
  {
    active: { type: Boolean, default: true },
    product: { type: ObjectId, ref: 'Product' },
    status: { type: String },
    store: { type: ObjectId, ref: 'Store' },
    user: { type: ObjectId, ref: 'User' },
    variant: { type: ObjectId, ref: 'Product' },
  },
  { versionKey: false, timestamps: true }
)

wishlistSchema.index({ '$**': 'text' })
export const Wishlist = mongoose.model<WishlistDocument>(
  'Wishlist',
  wishlistSchema
)
