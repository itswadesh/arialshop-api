import mongoose, { Schema } from 'mongoose'
import { generateSlug } from '../utils'
import { OptionDocument } from '../types'
const { ObjectId } = Schema.Types

export const optionSchema = new mongoose.Schema(
  {
    active: { type: Boolean, default: true },
    categories: [],
    default_option: { type: ObjectId },
    info: { type: String },
    isFilter: { type: Boolean },
    key: { type: String },
    name: { type: String, required: true },
    options: [{ type: String }],
    pid: { type: ObjectId, ref: 'Product' },
    position: { type: Number, default: 0 },
    preselect: { type: Boolean },
    q: { type: String },
    required: { type: Boolean },
    slug: { type: String },
    store: { type: ObjectId, ref: 'Store' },
    type: { type: String },
    val: { type: String },
    values: [{ type: ObjectId, ref: 'OptionValue' }],
  },
  {
    versionKey: false,
    timestamps: true,
  }
)

optionSchema.pre('save', async function (this: OptionDocument) {
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
optionSchema.index({
  '$**': 'text',
})
export const Option = mongoose.model<OptionDocument>('Option', optionSchema)
