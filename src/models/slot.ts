import mongoose, { Schema } from 'mongoose'
import { SlotDocument } from '../types'
import { generateSlug } from '../utils'
const { ObjectId } = Schema.Types

//for delivery
const slotSchema = new Schema(
  {
    active: { type: Boolean, default: true },
    info: { type: String },
    name: { type: String, required: true },
    q: { type: String },
    slug: { type: String },
    store: { type: ObjectId, ref: 'Store' },
    uid: { type: ObjectId, ref: 'User' },
    val: { type: String },
  },
  {
    timestamps: true,
  }
)

slotSchema.pre('save', async function (this: SlotDocument) {
  // if (!this.slug) {
  // this.slug = await generateSlug(this.name, this.slug, 'string')
  // }
  this.q = this.name ? this.name.toLowerCase() + ' ' : ''
  this.q += this.val ? this.val.toLowerCase() + ' ' : ''
  this.q += this.active ? this.active + ' ' : ''
  this.q = this.q.trim()
})
slotSchema.index({
  '$**': 'text',
})
export const Slot = mongoose.model<SlotDocument>('Slot', slotSchema)
