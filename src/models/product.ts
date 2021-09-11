import mongoose, { Schema } from 'mongoose'
import { ProductDocument } from '../types'
import { generateSlug } from '../utils'
import {
  brandSchema,
  colorSchema,
  sizeSchema,
  categorySchema,
  userSchema,
  featureSchema,
  optionSchema,
} from '../models'
import { ELASTIC_NODE } from '../config'

const { ObjectId } = Schema.Types

const schemaOptions = {
  toObject: { getters: true },
  toJSON: { getters: true },
  versionKey: false,
  timestamps: true,
}

export const productSchema = new Schema(
  {
    active: { type: Boolean, default: true, es_indexed: true },
    ageMax: { type: Number, es_indexed: true },
    ageMin: { type: Number, es_indexed: true },
    ageUnit: { type: String, es_indexed: true }, //enum: ['years', 'months','year', 'month']
    approved: { type: Boolean, default: false, es_indexed: true },
    articleCode: { type: String, es_indexed: true },
    assorted: { type: String, es_indexed: true },
    availability: { type: String, es_indexed: true }, //in stock - Item ships immediately,out of stock - No plan to restock,available for order - Ships in 1–2 weeks,discontinued
    barcode: { type: String, es_indexed: true },
    batchNo: { type: String, es_indexed: true },
    brand: {
      type: ObjectId,
      ref: 'Brand',
      es_type: 'nested',
      es_include_in_parent: true,
      es_schema: brandSchema,
      es_indexed: true,
      es_select: 'name slug',
    },
    categories: [
      {
        type: ObjectId,
        ref: 'Category',
        es_type: 'nested',
        es_include_in_parent: true,
        es_schema: categorySchema,
        es_indexed: true,
        es_select: 'slug',
      },
    ],
    category: {
      type: ObjectId,
      ref: 'Category',
      es_type: 'nested',
      es_include_in_parent: true,
      es_schema: categorySchema,
      es_indexed: true,
      es_select: 'slug',
    },
    categoryPool: [
      {
        type: ObjectId,
        ref: 'Category',
        es_type: 'nested',
        es_include_in_parent: true,
        es_schema: categorySchema,
        es_indexed: true,
        es_select: 'slug',
      },
    ],
    cgst: { type: Number, es_indexed: true, default: 0 },
    channels: [{ type: ObjectId, ref: 'Channel' }],
    city: { type: String, default: 'Mumbai', es_indexed: true },
    collections: [{ type: ObjectId, ref: 'Collection' }],
    color: {
      type: ObjectId,
      ref: 'Color',
      es_type: 'nested',
      es_include_in_parent: true,
      es_schema: colorSchema,
      es_indexed: true,
      es_select: 'name',
    },
    colorGroup: [{ type: ObjectId, ref: 'Product' }],
    condition: { type: String, es_indexed: true }, //new, refurbished, or used.
    countryOfOrigin: { type: String, es_indexed: true },
    currency: { type: String, es_indexed: true },
    daily: { type: Boolean, default: false },
    deliveryDays: { type: Number, default: 0 },
    demo: { type: Boolean, default: false },
    description: { type: String, es_indexed: true },
    eanNo: { type: String, es_indexed: true },
    enableZips: { type: Boolean, default: false },
    expiryDate: { type: String, es_indexed: true },
    featured: { type: Boolean, default: false, es_indexed: true },
    features: [
      {
        type: ObjectId,
        ref: 'Feature',
        // es_type: 'nested',
        // es_include_in_parent: true,
        // es_schema: featureSchema,
        // es_indexed: true,
        // es_select: 'name',
      },
    ],
    files: [{ type: String }], //in case product have files like books etc
    gender: { type: String, es_indexed: true },
    googleMerchantProductId: { type: String, es_indexed: true },
    group: { type: String, es_indexed: true },
    gtin: { type: String, es_indexed: true },
    height: { type: Number, es_indexed: true },
    hot: { type: Boolean, default: false, es_indexed: true },
    hsn: { type: String, es_indexed: true },
    igst: { type: Number, es_indexed: true, default: 0 },
    images: [{ type: String, es_indexed: true }],
    img: { type: String, es_indexed: true },
    info: { type: String },
    itemId: { type: String, es_indexed: true },
    keyFeatures: [{ type: String, es_indexed: true }],
    keywords: { type: String, es_indexed: true },
    keywordsA: {
      type: Array,
      es_indexed: true,
      es_type: 'completion',
    }, // For ES Autocomplete
    length: { type: Number, es_indexed: true },
    link: { type: String, es_indexed: true },
    manufacturer: { type: String, es_indexed: true },
    metaDescription: { type: String, es_indexed: true },
    mfgDate: { type: String, es_indexed: true },
    mrp: { type: Number, default: 0, es_indexed: true },
    discount: { type: Number, default: 0, es_indexed: true },
    name: { type: String, es_indexed: true, required: true },
    new: { type: Boolean, default: false, es_indexed: true },
    options: [
      {
        type: ObjectId,
        ref: 'Option',
        es_type: 'nested',
        es_include_in_parent: true,
        es_schema: optionSchema,
        es_indexed: true,
        es_select: 'name',
      },
    ],
    parentBrand: {
      type: ObjectId,
      ref: 'Brand',
      es_type: 'nested',
      es_include_in_parent: true,
      es_schema: brandSchema,
      es_indexed: true,
      es_select: 'name slug',
    },
    parentCategory: { type: ObjectId, ref: 'Category' },
    pincodes: [{ type: String, es_indexed: true }],
    popularity: { type: Number, default: 0, es_indexed: true },
    position: { type: Number, default: 0, es_indexed: true },
    price: { type: Number, default: 0, es_indexed: true },
    productDetails: [{ type: ObjectId, ref: 'Feature' }],
    productMasterId: { type: String, es_indexed: true },
    q: { type: String },
    ratings: { type: Number, default: 0 },
    recommended: { type: Boolean, default: false, es_indexed: true },
    relatedProducts: [{ type: ObjectId, ref: 'Product', es_indexed: true }],
    replaceAllowed: { type: Boolean, default: false, es_indexed: true },
    returnAllowed: { type: Boolean, default: false, es_indexed: true },
    returnInfo: { type: String, es_indexed: true },
    returnValidityInDays: { type: Number, default: 0, es_indexed: true },
    reviews: { type: Number, default: 0 },
    sale: { type: Boolean, default: false, es_indexed: true },
    sales: { type: Number, default: 0, es_indexed: true },
    sgst: { type: Number, es_indexed: true, default: 0 },
    size: {
      type: ObjectId,
      ref: 'Size',
      es_type: 'nested',
      es_include_in_parent: true,
      es_schema: sizeSchema,
      es_indexed: true,
      // es_select: 'name',
    },
    sizechart: { type: String, es_indexed: true },
    sizeGroup: [{ type: ObjectId, ref: 'Product' }],
    sku: { type: String, es_indexed: true }, // Removed unique true because it also identifies null as duplicate
    slug: { type: String, es_indexed: true },
    sort: { type: Number, default: 0 },
    specifications: [{ type: ObjectId, ref: 'Feature' }],
    status: { type: String },
    stock: { type: Number, default: 0, es_indexed: true },
    store: { type: ObjectId, ref: 'Store', es_indexed: true },
    styleCode: { type: String, es_indexed: true },
    styleId: { type: String, es_indexed: true },
    tax: { type: Number, default: 0 },
    time: { type: String },
    title: { type: String, es_indexed: true },
    trackInventory: { type: Boolean, default: false, es_indexed: true },
    trending: { type: Boolean, default: false, es_indexed: true },
    type: { type: String, es_indexed: true, default: 'physical' }, //physical or digital(virtual) or service (used place order need address or not)
    unit: { type: String, default: 'None', es_indexed: true },
    variants: [{ type: ObjectId, ref: 'Variant' }],
    vendor: {
      type: ObjectId,
      ref: 'User',
      required: true,
      // es_type: 'nested',
      // es_include_in_parent: true,
      // es_schema: userSchema,
      // es_indexed: true,
      // es_select: 'firstName lastName',
    },
    warranty: { type: String, es_indexed: true },
    weight: { type: Number, es_indexed: true },
    width: { type: Number, es_indexed: true },
    zips: [{ type: String }],
    createdAt: { type: Date, es_type: 'date', es_indexed: true },
    updatedAt: { type: Date, es_type: 'date', es_indexed: true },
  },
  schemaOptions
)

productSchema.pre('save', async function (this: ProductDocument) {
  const price = this.price || 0
  const mrp = this.mrp || 0
  if (price < 1) this.discount = 0
  else this.discount = Math.floor(100 - (price * 100) / mrp)
  if (this.discount < 1) this.discount = 0

  this.keywordsA = this.keywords ? this.keywords.split(',') : []
  if (this.keywordsA.length > 0) {
    this.keywordsA = this.keywordsA.filter((word) => word.trim())
  }
  if (!this.slug) {
    //  || this.isModified('name')) not working
    this.slug = await generateSlug(
      this.name,
      'product',
      this.slug,
      'string',
      this.store
    )
  }
  if (!this.styleId) {
    if (this.productMasterId && this.styleCode)
      this.styleId = this.productMasterId + '-' + this.styleCode
    else if (this.productMasterId && !this.styleCode)
      this.styleId = this.productMasterId
    else if (!this.productMasterId && this.styleCode)
      this.styleId = this.styleCode
    else this.styleId = this._id
  }
  this.q = this.sku ? this.sku + ' ' : ''
  this.q = this.name ? this.name.toLowerCase() + ' ' : ''
  this.q = this.slug ? this.slug.toLowerCase() + ' ' : ''
  this.q += this.description ? this.description.toLowerCase() + ' ' : ''
  this.q += this.barcode ? this.barcode + ' ' : ''
  this.q += this.status ? this.status.toLowerCase() + ' ' : ''
  this.q += ' '
  this.q = this.q.trim()
})
productSchema.index({
  '$**': 'text',
})

const mongoosastic = require('mongoosastic')

try {
  productSchema.plugin(mongoosastic, {
    hosts: [ELASTIC_NODE],
    // auth: `elastic:${ELASTIC_PASSWORD}`,
    populate: [
      { path: 'brand', select: 'name slug' },
      { path: 'parentBrand', select: 'name slug' },
      { path: 'size', select: 'name' },
      { path: 'color', select: 'name' },
      // { path: 'vendor', select: 'firstName lastName' },
      { path: 'options', select: 'name' },
      { path: 'category', select: 'slug' },
      { path: 'categories', select: 'slug' },
      { path: 'categoryPool', select: 'slug' },
      // { path: 'features', select: 'name' },
    ],
  })
} catch (e) {
  console.log('mongoosastic err:: ', e)
}
// let mexp = require('mongoose-elasticsearch-xp')
// productSchema.plugin(mexp, {
//   hosts: [ELASTIC_SEARCH],
//   auth: `elastic:${ELASTIC_PASSWORD}`,
// })
export const Product = mongoose.model<ProductDocument>('Product', productSchema)

// @ts-ignore
// Product.createMapping({
//   keywordsA: {
//     type: 'completion',
//   },
// })
// Product.createMapping(
//   {
//     keywordsA: {
//       type: 'completion',
//     },
//   },
//   function (err, mapping) {
//     console.log('zzzzzzzzzzzzzzzzzzzzzzzzzzz', err)
//     // do neat things here
//   }
// )
const Promise = require('bluebird')
// @ts-ignore
Product.esSearch = Promise.promisify(Product.esSearch, { context: Product })
