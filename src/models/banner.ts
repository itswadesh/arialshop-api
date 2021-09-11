import mongoose, { Schema } from 'mongoose'
import { BannerDocument } from '../types'
const { ObjectId } = Schema.Types

const bannerSchema = new Schema(
  {
    active: { type: Boolean, default: true },
    //these group field is used for group of banners(like- Trending in Western{groupTitle} have 10 banners )
    demo: { type: Boolean, default: false },
    groupId: { type: String },
    groupTitle: { type: String },
    heading: { type: String },
    img: { type: String },
    link: { type: String },
    pageId: { type: String, default: 'home' },
    pageType: { type: String },
    isLinkExternal: { type: Boolean },
    q: { type: String },
    sort: { type: Number },
    store: { type: ObjectId, ref: 'Store' },
    user: { type: ObjectId, ref: 'User' },
    type: { type: String, default: 'slider' },
  },
  {
    versionKey: false,
    timestamps: true,
  }
)

bannerSchema.index({
  '$**': 'text',
})
export const Banner = mongoose.model<BannerDocument>('Banner', bannerSchema)
