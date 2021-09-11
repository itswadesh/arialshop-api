import mongoose, { Schema } from 'mongoose'
import { FaqTopicDocument } from '../types'
const { ObjectId } = Schema.Types

const faqTopicSchema = new mongoose.Schema(
  {
    // slug: { type: String },
    active: { type: Boolean, default: true },
    for: { type: String, required: true }, //This will used for Manager or customer or as per the users
    name: { type: String, required: true },
    q: { type: String },
    uid: { type: ObjectId, ref: 'User' },
  },
  {
    versionKey: false,
    timestamps: true,
  }
)

faqTopicSchema.index({
  '$**': 'text',
})
export const FaqTopic = mongoose.model<FaqTopicDocument>(
  'FaqTopic',
  faqTopicSchema
)
