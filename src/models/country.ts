import mongoose, { Schema } from 'mongoose'
import { CountryDocument } from '../types'
const { ObjectId } = Schema.Types

const countrySchema = new Schema(
  {
    // slug: { type: String },
    active: { type: Boolean, default: true },
    dialCode: { type: String },
    code: { type: String },
    flag: { type: String },
    img: { type: String },
    lang: { type: String },
    name: { type: String, required: true },
    q: { type: String },
    sort: { type: Number },
    states: [{ type: ObjectId, ref: 'State' }],
    value: { type: String },
  },
  {
    versionKey: false,
    timestamps: true,
  }
)

countrySchema.index({
  '$**': 'text',
})
export const Country = mongoose.model<CountryDocument>('Country', countrySchema)
