import mongoose, { Schema } from 'mongoose'
import { generateSlug } from '../utils'
import { UnitDocument } from '../types'
const { ObjectId } = Schema.Types

const unitSchema = new mongoose.Schema(
  {
    // slug: { type: String },
    active: { type: Boolean, default: true },
    featured: { type: Boolean, default: false },
    img: { type: String },
    info: { type: String },
    name: { type: String },
    q: { type: String },
    store: { type: ObjectId, ref: 'Store' },
    user: { type: ObjectId, ref: 'User' },
  },
  {
    versionKey: false,
    timestamps: true,
  }
)
unitSchema.pre('save', async function (this: UnitDocument) {
  // if (!this.slug) {
  // this.slug = await generateSlug(this.name, this.slug, 'string')
  // }
  this.q = this.name ? this.name + ' ' : ''
  this.q += this.info ? this.info + ' ' : ''
  this.q += this.active ? this.active + ' ' : ''
  this.q += ' '
})
unitSchema.index({
  '$**': 'text',
})
export const Unit = mongoose.model<UnitDocument>('Unit', unitSchema)
