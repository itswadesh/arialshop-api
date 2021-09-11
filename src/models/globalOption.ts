import mongoose, { Schema } from 'mongoose'
import { generateSlug } from '../utils'
import { GlobalOptionDocument } from '../types'

const { ObjectId } = Schema.Types

const globalOptionSchema = new mongoose.Schema(
  {
    active: { type: Boolean, default: true },
    categories: [{ type: String }],
    info: { type: String },
    isFilter: { type: Boolean },
    key: { type: String },
    name: { type: String, required: true },
    position: { type: Number, default: 0 },
    preselect: { type: Boolean },
    q: { type: String },
    required: { type: Boolean },
    slug: { type: String },
    type: { type: String },
    user: { type: ObjectId, ref: 'User' }, //created By
    val: { type: String },
    values: [{ type: ObjectId, ref: 'GlobalOptionValue' }],
  },
  {
    versionKey: false,
    timestamps: true,
  }
)
globalOptionSchema.pre('save', async function (this: GlobalOptionDocument) {
  if (this.name)
    this.name =
      this.name.charAt(0).toUpperCase() + this.name.substr(1).toLowerCase()
  // if (!this.slug) {
  // this.slug = await generateSlug(this.name, this.slug, 'string')
  // }
  this.q = this.val ? this.val + ' ' : ''
  this.q += this.info ? this.info + ' ' : ''
  // this.q += this.slug ? this.slug + ' ' : ''
  this.q += this.active ? this.active + ' ' : ''
  this.q += ' '
})

globalOptionSchema.index({
  '$**': 'text',
})
export const GlobalOption = mongoose.model<GlobalOptionDocument>(
  'GlobalOption',
  globalOptionSchema
)
