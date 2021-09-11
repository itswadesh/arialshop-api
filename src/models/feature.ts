import mongoose, { Schema } from 'mongoose'
import { generateSlug } from '../utils'
import { FeatureDocument } from '../types'
const { ObjectId } = Schema.Types

export const featureSchema = new mongoose.Schema(
  {
    // slug: { type: String },
    active: { type: Boolean, default: true },
    name: { type: String, es_indexed: true, required: true },
    product: { type: ObjectId, ref: 'Product', required: true },
    q: { type: String },
    store: { type: ObjectId, ref: 'Store' },
    type: {
      type: String,
      enum: ['specification', 'details'],
    },
    user: { type: ObjectId, ref: 'User' },
    value: { type: String },
  },
  {
    versionKey: false,
    timestamps: true,
  }
)

featureSchema.pre('save', async function (this: FeatureDocument) {
  // Convert to titleCase
  if (this.name)
    this.name =
      this.name.charAt(0).toUpperCase() + this.name.substr(1).toLowerCase()
  // if (!this.slug) {
  // this.slug = await generateSlug(this.name, this.slug, 'string')
  // }
  this.q = this.value ? this.value + ' ' : ''
  // this.q += this.slug ? this.slug + ' ' : ''
  this.q += this.active ? this.active + ' ' : ''
  this.q += ' '
})
featureSchema.index({
  '$**': 'text',
})
export const Feature = mongoose.model<FeatureDocument>('Feature', featureSchema)
