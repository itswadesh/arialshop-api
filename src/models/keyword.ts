import mongoose, { Schema } from 'mongoose'
import { KeywordDocument } from '../types'
import { ELASTIC_NODE } from '../config'
// const { ObjectId } = Schema.Types
// import { productSchema, categorySchema, brandSchema } from '../models'

const schemaOptions = {
  toObject: { getters: true },
  toJSON: { getters: true },
  versionKey: false,
  timestamps: true,
}
const keywordSchema = new Schema(
  {
    active: { type: Boolean, default: true },
    brand: { type: String, es_indexed: true },
    category: { type: String, es_indexed: true },
    name: { type: String, required: true },
    product: { type: String, es_indexed: true },
  },
  schemaOptions
)

const mongoosastic = require('mongoosastic')

try {
  keywordSchema.plugin(mongoosastic, {
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

export const Keyword = mongoose.model<KeywordDocument>('Keyword', keywordSchema)

const Promise = require('bluebird')
// @ts-ignore
Keyword.esSearch = Promise.promisify(Keyword.esSearch, {
  context: Keyword,
})
