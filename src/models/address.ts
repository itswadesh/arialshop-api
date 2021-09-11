import mongoose, { Schema } from 'mongoose'
import { AddressDocument } from '../types'

const { ObjectId } = Schema.Types

const addressSchema = new Schema(
  {
    active: { type: Boolean, default: true }, // currently active
    address: { type: String }, // area and street
    city: { type: String },
    company: { type: String },
    country: { type: String },
    deliveryInstructions: { type: String },
    district: { type: String },
    email: { type: String },
    firstName: { type: String },
    isResidential: { type: Boolean, default: true },
    lastName: { type: String },
    lat: { type: Number },
    lng: { type: Number },
    phone: { type: String },
    state: { type: String },
    store: { type: ObjectId, ref: 'Store' },
    town: { type: String },
    type: { type: String }, // home or work (will not use anymore, will use isResidential)
    user: { type: ObjectId, ref: 'User' },
    zip: { type: Number },
  },
  {
    versionKey: false,
    timestamps: true,
  }
)
addressSchema.index({
  '$**': 'text',
})
export const Address = mongoose.model<AddressDocument>('Address', addressSchema)
