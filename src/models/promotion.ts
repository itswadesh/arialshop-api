import mongoose, { Schema } from 'mongoose'
import { generateSlug } from '../utils'
import { PromotionDocument } from '../types'

const promotionSchema = new Schema(
  {
    // slug: { type: String },
    action: { type: Object, default: { type: 'Fixed', val: '0' } },
    active: { type: Boolean, default: true },
    condition: { type: Array, default: [] },
    description: { type: String },
    featured: { type: Boolean, default: false },
    img: { type: String },
    name: { type: String },
    platform: { type: String, default: 'Website' },
    priority: { type: Number },
    productCondition: { type: String },
    q: { type: String },
    type: { type: String, default: 'product' },
    uid: { type: String },
    validFromDate: { type: Date, default: Date.now() },
    validToDate: {
      type: Date,
      default: () => Date.now() + 24 * 60 * 60 * 1000,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
)

// promotionSchema.pre('save', async function (this: PromotionDocument) {
//   // if (!this.slug) {
//   this.slug = await generateSlug(this.name, this.slug, 'string')
//   // }
//   this.q = this.slug ? this.slug.toLowerCase() + ' ' : ''
//   this.q += ' '
//   this.q = this.q.trim()
// })

promotionSchema.index({
  '$**': 'text',
})

export const Promotion = mongoose.model<PromotionDocument>(
  'Promotion',
  promotionSchema
)
