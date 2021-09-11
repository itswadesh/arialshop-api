import mongoose, { Schema } from 'mongoose'
import { generateSlug } from '../utils'
import { BlogDocument } from '../types'
const { ObjectId } = Schema.Types

const blogSchema = new mongoose.Schema(
  {
    active: { type: Boolean, default: true },
    content: { type: String },
    excerpt: { type: String },
    img: { type: String },
    published_at: { type: String },
    q: { type: String },
    slug: { type: String },
    status: { type: String },
    store: { type: ObjectId, ref: 'Store' },
    tags: [{ type: String }],
    title: { type: String, required: true },
    user: { type: ObjectId, ref: 'User' },
  },
  {
    versionKey: false,
    timestamps: true,
  }
)

blogSchema.pre('save', async function (this: BlogDocument) {
  if (!this.slug) {
    this.slug = await generateSlug(
      this.title,
      'blog',
      this.slug,
      'string',
      this.store
    )
  }
  this.q = this.slug ? this.slug.toLowerCase() + ' ' : ''
  this.q += ' '
  this.q = this.q.trim()
})

blogSchema.index({
  '$**': 'text',
})
export const Blog = mongoose.model<BlogDocument>('Blog', blogSchema)
