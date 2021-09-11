import mongoose, { Schema } from 'mongoose'
import { FaqDocument } from '../types'
const { ObjectId } = Schema.Types

const faqSchema = new mongoose.Schema(
  {
    active: { type: Boolean, default: true },
    answer: { type: String },
    q: { type: String },
    question: { type: String, required: true },
    store: { type: ObjectId, ref: 'Store' },
    topic: { type: ObjectId, ref: 'Topic' }, //for future use(mean based in faqTopic)
    uid: { type: ObjectId, ref: 'User' },
  },
  {
    versionKey: false,
    timestamps: true,
  }
)

// faqSchema.pre('save', function (this: ColorDocument) {
//   if (this.name)
//     // Convert to Uppercase
//     this.name =
//       this.name.charAt(0).toUpperCase() + this.name.substr(1).toLowerCase()
//   this.q = this.val ? this.val + ' ' : ''
//   this.q += this.info ? this.info + ' ' : ''
//   this.q += this.value ? this.value + ' ' : ''
//   this.q += this.slug ? this.slug + ' ' : ''
//   this.q += this.featured ? this.featured + ' ' : ''
//   this.q += this.active ? this.active + ' ' : ''
//   this.q += ' '
// })
faqSchema.index({
  '$**': 'text',
})
export const Faq = mongoose.model<FaqDocument>('Faq', faqSchema)
