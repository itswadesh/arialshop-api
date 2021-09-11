import mongoose, { Schema } from 'mongoose'
import { ReviewDocument } from '../types'
const { ObjectId } = Schema.Types

const reviewSchema = new Schema(
  {
    active: { type: Boolean, default: true },
    message: { type: String },
    pid: { type: ObjectId, ref: 'Product' },
    q: { type: String },
    rating: { type: Number, default: 0 },
    store: { type: ObjectId, ref: 'Store' },
    user: { type: ObjectId, ref: 'User' },
    variant: { type: ObjectId, ref: 'Variant' },
    vendor: { type: ObjectId, ref: 'User' },
    votes: { voters: [{ type: ObjectId, ref: 'User' }], count: Number },
  },
  { versionKey: false, timestamps: true }
)

reviewSchema.pre('save', async function (this: ReviewDocument) {
  this.q = this.message ? this.message.toLowerCase() + ' ' : ''
  this.q += this.active ? this.active + ' ' : ''
  this.q = this.q.trim()
})
reviewSchema.index({ '$**': 'text' })
export const Review = mongoose.model<ReviewDocument>('Review', reviewSchema)
