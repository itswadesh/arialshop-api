import mongoose, { Schema } from 'mongoose'
import { generateSlug } from '../utils'
import { SizeDocument } from '../types'
const { ObjectId } = Schema.Types

export const sizeSchema = new mongoose.Schema(
  {
    // q: { type: String },
    // slug: { type: String },
    active: { type: Boolean, default: true },
    featured: { type: Boolean, default: false },
    img: { type: String },
    info: { type: String },
    name: { type: String, es_indexed: true, required: true },
    sort: { type: Number },
    store: { type: ObjectId, ref: 'Store' },
    user: { type: ObjectId, ref: 'User' },
  },
  {
    versionKey: false,
    timestamps: true,
  }
)
// sizeSchema.pre('save', async function (this: SizeDocument) {
//   this.slug = await generateSlug(this.name, this.slug, 'string')
//   this.q += this.info ? this.info + ' ' : ''
//   this.q += this.active ? this.active + ' ' : ''
//   this.q += ' '
// })
sizeSchema.index({
  '$**': 'text',
})
export const Size = mongoose.model<SizeDocument>('Size', sizeSchema)
