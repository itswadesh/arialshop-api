import mongoose, { Schema } from 'mongoose'
import { generateSlug } from '../utils'
import { CollectionDocument } from '../types'
const { ObjectId } = Schema.Types

const collectionSchema = new mongoose.Schema(
  {
    active: { type: Boolean, default: true },
    products: [{ type: ObjectId, ref: 'Product' }],
    description: { type: String },
    images: [{ type: String }],
    img: { type: String },
    name: { type: String, required: true },
    q: { type: String },
    slug: { type: String },
    sort: { type: String },
    store: { type: ObjectId, ref: 'Store' },
    type: { type: String, default: 'Manual' }, //Manual or Dynamic
    user: { type: ObjectId, ref: 'User' },
    //dynamic have filter(not using dynamic now, Dynamic is for future)
    // field: { type: String }, //price or brand or categories or attributes
    // operator: { type: String }, //equals or not equels qor greater than or less than
    // value: [{ type: String }],
  },
  {
    versionKey: false,
    timestamps: true,
  }
)

// collectionSchema.pre('save', async function (this: CollectionDocument) {
//   if (!this.slug) {
//     this.slug = await generateSlug(this.name, 'blog', this.slug, 'string',this.store)
//   }
//   this.q = this.slug ? this.slug.toLowerCase() + ' ' : ''
//   this.q += ' '
//   this.q = this.q.trim()
// })

collectionSchema.index({
  '$**': 'text',
})
export const Collection = mongoose.model<CollectionDocument>(
  'Collection',
  collectionSchema
)
