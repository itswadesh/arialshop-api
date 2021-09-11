import mongoose, { Schema } from 'mongoose'
import { EmailTemplateDocument } from '../types'
const { ObjectId } = Schema.Types

const emailTemplateSchema = new mongoose.Schema(
  {
    active: { type: Boolean, default: true },
    content: { type: String, required: true },
    description: { type: String },
    link: { type: String },
    name: { type: String, required: true },
    store: { type: ObjectId, ref: 'Store' },
    title: { type: String },
    user: { type: ObjectId, ref: 'User' },
  },
  {
    versionKey: false,
    timestamps: true,
  }
)

emailTemplateSchema.index({
  '$**': 'text',
})
export const EmailTemplate = mongoose.model<EmailTemplateDocument>(
  'EmailTemplate',
  emailTemplateSchema
)
