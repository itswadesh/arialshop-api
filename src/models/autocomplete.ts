import mongoose, { Schema } from 'mongoose'
import { AutocompleteDocument } from '../types'
import { ELASTIC_NODE } from '../config'
// import { productSchema, categorySchema, brandSchema } from '../models'
const { ObjectId } = Schema.Types

const schemaOptions = {
  toObject: { getters: true },
  toJSON: { getters: true },
  versionKey: false,
  timestamps: true,
}

const autocompleteSchema = new Schema(
  {
    brand: { type: ObjectId, ref: 'Brand' },
    category: { type: ObjectId, ref: 'Category' },
    img: { type: String, es_indexed: true },
    name: { type: String, es_indexed: true },
    product: { type: ObjectId, ref: 'Product' },
    store: { type: ObjectId, ref: 'Store' },
    storeId: { type: String, es_indexed: true },
    type: { type: String },
  },
  schemaOptions
  // {
  //   name: { type: String, required: true },
  //   product: {
  //     type: ObjectId,
  //     ref: 'Product',
  //     es_type: 'nested',
  //     es_include_in_parent: true,
  //     es_schema: productSchema,
  //     es_indexed: true,
  //     es_select: 'keywordsA',
  //   },
  //   category: {
  //     type: ObjectId,
  //     ref: 'Category',
  //     es_type: 'nested',
  //     es_include_in_parent: true,
  //     es_schema: categorySchema,
  //     es_indexed: true,
  //     es_select: 'name',
  //   },
  //   brand: {
  //     type: ObjectId,
  //     ref: 'Brand',
  //     es_type: 'nested',
  //     es_include_in_parent: true,
  //     es_schema: brandSchema,
  //     es_indexed: true,
  //     es_select: 'name',
  //   },
  // },
  // schemaOptions
)

const mongoosastic = require('mongoosastic')

try {
  autocompleteSchema.plugin(mongoosastic, {
    hosts: [ELASTIC_NODE],
    // populate: [
    //   { path: 'product', select: 'keywordsA' },
    //   { path: 'category', select: 'name' },
    //   { path: 'brand', select: 'name' },
    // ],
  })
} catch (e) {
  console.log('mongoosastic err:: ', e)
}

export const Autocomplete = mongoose.model<AutocompleteDocument>(
  'Autocomplete',
  autocompleteSchema
)

const Promise = require('bluebird')
// @ts-ignore
Autocomplete.esSearch = Promise.promisify(Autocomplete.esSearch, {
  context: Autocomplete,
})
