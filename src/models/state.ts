import mongoose, { Schema } from 'mongoose'
import { generateSlug } from '../utils'
import { StateDocument } from '../types'

const stateSchema = new Schema(
  {
    // slug: { type: String },
    active: { type: Boolean, default: true },
    code: { type: String },
    flag: { type: String },
    img: { type: String },
    lang: { type: String },
    name: { type: String, required: true },
    q: { type: String },
    sort: { type: Number },
    value: { type: String },
  },
  {
    versionKey: false,
    timestamps: true,
  }
)

// stateSchema.pre('save', async function (this: StateDocument) {
//   // if (!this.slug) {
//   // this.slug = await generateSlug(this.name, this.slug, 'string')
//   // }
//   this.q = this.slug ? this.slug.toLowerCase() + ' ' : ''
//   this.q += ' '
//   this.q = this.q.trim()
// })

stateSchema.index({
  '$**': 'text',
})
export const State = mongoose.model<StateDocument>('State', stateSchema)
