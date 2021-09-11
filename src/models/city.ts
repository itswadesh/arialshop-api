import mongoose, { Schema } from 'mongoose'
import { generateSlug } from '../utils'
import { CityDocument } from '../types'

const { ObjectId } = Schema.Types

const citySchema = new Schema(
  {
    active: { type: Boolean, default: true },
    lat: { type: Number },
    lng: { type: Number },
    name: { type: String, required: true },
    q: { type: String },
    slug: { type: String },
    user: { type: ObjectId, ref: 'User' },
  },
  { timestamps: true }
)

citySchema.pre('save', async function (this: CityDocument) {
  // if (!this.slug) {
  // this.slug = await generateSlug(this.name, this.slug, 'string',this.store)
  // }
})

citySchema.index({ '$**': 'text' })

export const City = mongoose.model<CityDocument>('City', citySchema)
