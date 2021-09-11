import mongoose, { Schema } from 'mongoose'
import { PageDocument } from '../types'
import { generateSlug } from '../utils'

const { ObjectId } = Schema.Types

const pageSchema = new Schema(
  {
    content: { type: String },
    description: { type: String },
    menuTitle: { type: String },
    name: { type: String, required: true },
    slug: { type: String },
    title: { type: String },
    user: { type: ObjectId, ref: 'User' },
    active: { type: Boolean, default: true },
    q: { type: String },
  },
  { versionKey: false, timestamps: true }
)

pageSchema.pre('save', async function (this: PageDocument) {
  if (!this.slug) {
    this.slug = await generateSlug(this.name, 'page', this.slug, 'string', null)
  }
  if (this.name)
    this.name =
      this.name.charAt(0).toUpperCase() + this.name.substr(1).toLowerCase()
})

pageSchema.index({ '$**': 'text' })
export const Page = mongoose.model<PageDocument>('Page', pageSchema)
