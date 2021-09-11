import mongoose, { Schema } from 'mongoose'
import { generateSlug } from '../utils'
import { ColorDocument } from '../types'
const { ObjectId } = Schema.Types

export const colorSchema = new mongoose.Schema(
  {
    // slug: { type: String },
    active: { type: Boolean, default: true },
    color_code: { type: String, required: true },
    featured: { type: Boolean, default: false },
    info: { type: String },
    name: { type: String, required: true, es_indexed: true },
    q: { type: String },
    store: { type: ObjectId, ref: 'Store' },
    uid: { type: String },
    val: { type: String },
    value: { type: String },
  },
  {
    versionKey: false,
    timestamps: true,
  }
)
// colorSchema.path('name').validate(function (value: string, done: string) {
//   return this.constructor
//     .findOne({ name: value })
//     .exec()
//     .then((color: string) => {
//       if (color) {
//         if (this.name === color.name) {
//           return done(true)
//         }
//         return done(false)
//       }
//       return done(true)
//     })
//     .catch(function (err) {
//       throw err
//     })
// }, 'Color name already exists')

colorSchema.pre('save', async function (this: ColorDocument) {
  if (this.name)
    // Convert to Uppercase
    this.name =
      this.name.charAt(0).toUpperCase() + this.name.substr(1).toLowerCase()
  // if (!this.slug) {
  // this.slug = await generateSlug(this.name, this.slug, 'string',this.store)
  // }
  this.q = this.val ? this.val + ' ' : ''
  this.q += this.info ? this.info + ' ' : ''
  this.q += this.value ? this.value + ' ' : ''
  // this.q += this.slug ? this.slug + ' ' : ''
  this.q += this.featured ? this.featured + ' ' : ''
  this.q += this.active ? this.active + ' ' : ''
  this.q += ' '
})
colorSchema.index({
  '$**': 'text',
})
export const Color = mongoose.model<ColorDocument>('Color', colorSchema)
