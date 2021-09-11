import mongoose, { Schema } from 'mongoose'
import { SearchDocument } from '../types'
const { ObjectId } = Schema.Types

const schemaOptions = {
  toObject: { getters: true },
  toJSON: { getters: true },
  versionKey: false,
  timestamps: true,
}
const searchSchema = new Schema(
  {
    popularity: { type: String, required: true },
    store: { type: ObjectId, ref: 'Store' },
    text: { type: String, required: true },
  },
  schemaOptions
)

searchSchema.index({
  '$**': 'text',
})
export const Search = mongoose.model<SearchDocument>('Search', searchSchema)
