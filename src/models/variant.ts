import mongoose, { Schema } from 'mongoose'
import { VariantDocument } from '../types'

const { ObjectId } = Schema.Types

const schemaOptions = {
  toObject: { getters: true },
  toJSON: { getters: true },
  versionKey: false,
  timestamps: true,
}

const variantSchema = new Schema(
  {
    active: { type: Boolean, default: true },
    barcode: { type: String },
    color: { type: String },
    discount: { type: Number, default: 0 },
    enableUnitPrice: { type: Boolean, default: false },
    height: { type: Number, default: 0 },
    images: [{ type: String }],
    img: { type: String },
    length: { type: Number, default: 0 },
    mrp: { type: Number, default: 0, es_indexed: true },
    name: { type: String },
    offer: { type: Number, default: 0 },
    options: [Object],
    pid: { type: ObjectId, ref: 'Product' },
    price: { type: Number, default: 0, es_indexed: true },
    q: { type: String },
    saleFromDate: { type: Date, default: Date.now },
    saleToDate: {
      type: Date,
      default: () => Date.now() + 1 * 365 * 24 * 60 * 60 * 1000,
    },
    sameImages: { type: Boolean, default: false },
    shipping: { type: Number, default: 0 },
    sku: { type: String },
    sort: { type: Number },
    stock: { type: Number, default: 0 },
    trackInventory: { type: Boolean, default: false },
    unit: { type: String, default: 'None' },
    weight: { type: Number, default: 0 },
    width: { type: Number, default: 0 },
  },
  schemaOptions
)

variantSchema.pre('save', async function (this: VariantDocument) {
  this.q = this.sku ? this.sku + ' ' : ''
  this.q = this.name ? this.name.toLowerCase() + ' ' : ''
  this.q += this.barcode ? this.barcode.toLowerCase() + ' ' : ''
  this.q += ' '
  this.q = this.q.trim()
})
variantSchema.index({
  '$**': 'text',
})
export const Variant = mongoose.model<VariantDocument>('Variant', variantSchema)
