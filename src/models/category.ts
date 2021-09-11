import mongoose, { Schema } from 'mongoose'
import { CategoryDocument } from '../types'
import { saveCategoryArtifacts } from '../utils'
import { nextTick } from 'process'
import mongo from 'mongodb'
import { UserInputError } from 'apollo-server-express'

const { ObjectId } = Schema.Types
const schemaOptions = {
  toObject: { getters: true },
  toJSON: { getters: true },
  versionKey: false,
  timestamps: true,
}
export const categorySchema = new Schema(
  {
    active: { type: Boolean, default: true },
    attributes: [{ type: ObjectId, ref: 'Attribute' }],
    brand: { type: ObjectId, ref: 'Brand' },
    categoryId: { type: String }, //for import user(like category code)
    children: [{ type: ObjectId, ref: 'Category' }],
    count: { type: Number },
    description: { type: String, es_indexed: true },
    featured: { type: Boolean, default: false },
    img: { type: String },
    index: { type: Number },
    level: { type: Number, default: 0 },
    megamenu: { type: Boolean, default: true },
    meta: { type: String, es_indexed: true },
    metaDescription: { type: String, es_indexed: true },
    metaKeywords: { type: String, es_indexed: true },
    metaTitle: { type: String, es_indexed: true },
    name: { type: String, es_indexed: true, required: true },
    namePath: { type: String },
    namePathA: [{ type: String }],
    parent: { type: ObjectId, ref: 'Category' },
    path: { type: String },
    pathA: [{ type: ObjectId, ref: 'Category' }],
    pid: { type: String },
    position: { type: Number, default: 0 },
    q: { type: String },
    // scopes: [{ type: ObjectId, ref: 'Scope' }], not using
    refreshSlug: { type: Boolean, default: false },
    shopbycategory: { type: Boolean, default: false },
    sizechart: { type: String },
    slug: { type: String },
    slugPath: { type: String },
    slugPathA: [{ type: String }],
    store: { type: ObjectId, ref: 'Store' },
    user: { type: ObjectId, ref: 'User' }, //User who created this category
  },
  schemaOptions
)

// categorySchema.pre('findOneAndUpdate', async function (this: CategoryDocument) {
//   // @ts-ignore
//   const docToUpdate = await this.model.findById(this._id)
//   console.log(docToUpdate, this.name)
// })

// categorySchema.pre('findOneAndUpdate', async function () {
// @ts-ignore
// const docToUpdate = await this.model.findOne(this.getQuery())
// console.log('old..............', docToUpdate.parent)
// if (docToUpdate) {
//   // @ts-ignore
//   await this.model.updateOne(
//     // @ts-ignore
//     { _id: docToUpdate.parent },
//     // @ts-ignore
//     { $pull: { children: docToUpdate._id } }
//   )
// }
// })

// categorySchema.post('findOneAndUpdate', async function (doc: CategoryDocument) {

//   await saveCategoryArtifacts(doc)
// })
function dedupeIDs(objectIDs: Array<string>) {
  const ids: any = {}
  objectIDs.forEach((_id) => (ids[_id.toString()] = _id))
  return Object['values'](ids)
}
categorySchema.index({
  '$**': 'text',
})
export const Category = mongoose.model<CategoryDocument>(
  'Category',
  categorySchema
)
