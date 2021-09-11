import mongoose, { Schema } from 'mongoose'
import { generateSlug } from '../utils'
import { DiscountDocument } from '../types'
const { ObjectId } = Schema.Types

const discountSchema = new mongoose.Schema(
  {
    active: { type: Boolean, default: true },
    amount: { type: Number, default: 0 },
    applyOn: { type: String, default: 'allProducts' }, //Products that meets conditions
    description: { type: String, required: true },
    img: { type: String },
    name: { type: String, required: true },
    q: { type: String },
    ruleType: { type: String, required: true, default: 'product based' }, //Product based or Order based
    slug: { type: String },
    type: { type: String, required: true, default: 'flat' }, //Flat or Percentage
    // In case of advance settings
    maximumUsage: { type: Number, default: 0 },
    startDate: { type: Date },
    endDate: { type: Date },
    numberOfTimeUsed: { type: Number, default: 0 },
    seller: { type: ObjectId, ref: 'User' },
  },
  {
    versionKey: false,
    timestamps: true,
  }
)

// discountSchema.pre('save', async function (this: DiscountDocument) {
//   if (!this.slug) {
//     this.slug = await generateSlug(this.name, 'blog', this.slug, 'string')
//   }
//   this.q = this.slug ? this.slug.toLowerCase() + ' ' : ''
//   this.q += ' '
//   this.q = this.q.trim()
// })

discountSchema.index({
  '$**': 'text',
})
export const Discount = mongoose.model<DiscountDocument>(
  'Discount',
  discountSchema
)
