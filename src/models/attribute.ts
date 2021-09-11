import mongoose, { Schema } from 'mongoose'
import { AttributeDocument } from '../types'
const { ObjectId } = Schema.Types

const attributeSchema = new mongoose.Schema(
  {
    active: { type: Boolean, default: true },
    category: { type: ObjectId, ref: 'Category' },
    name: { type: String, required: true },
    q: { type: String },
    show: { type: Boolean, default: true },
    store: { type: ObjectId, ref: 'Store' },
    user: { type: ObjectId, ref: 'User' },
  },
  {
    versionKey: false,
    timestamps: true,
  }
)

attributeSchema.index({
  '$**': 'text',
})
export const Attribute = mongoose.model<AttributeDocument>(
  'Attribute',
  attributeSchema
)
