import mongoose, { Schema } from 'mongoose'
import { BrandDocument } from '../types'
import { generateSlug } from '../utils'
const { ObjectId } = Schema.Types

export const brandSchema = new Schema(
  {
    active: { type: Boolean, default: true },
    banner: { type: String },
    brand_id: { type: String }, //just for test same as brandId
    brandId: { type: String }, //id provided via admin/vendor manually
    facebookUrl: { type: String },
    featured: { type: Boolean, default: false },
    img: { type: String },
    info: { type: String },
    instaUrl: { type: String },
    linkedinUrl: { type: String },
    meta: { type: String },
    metaDescription: { type: String },
    metaKeywords: { type: String },
    metaTitle: { type: String },
    name: { type: String, es_indexed: true, required: true },
    parent: { type: ObjectId, ref: 'Brand' },
    position: { type: Number, default: 0 },
    q: { type: String },
    sizechart: { type: String },
    slug: { type: String, es_indexed: true }, // Used at product model
    store: { type: ObjectId, ref: 'Store' },
    twitterUrl: { type: String },
    user: { type: String },
    youtubeUrl: { type: String },
    pinterestUrl: { type: String },
    googleUrl: { type: String },
  },
  {
    versionKey: false,
    timestamps: true,
  }
)

brandSchema.pre('save', async function (this: BrandDocument) {
  if (!this.slug) {
    this.slug = await generateSlug(
      this.name,
      'brand',
      this.slug,
      'string',
      this.store
    )
  }
  this.q = this.slug ? this.slug.toLowerCase() + ' ' : ''
  this.q += ' '
  this.q = this.q.trim()
})

brandSchema.index({
  '$**': 'text',
})
export const Brand = mongoose.model<BrandDocument>('Brand', brandSchema)
