import mongoose, { Schema } from 'mongoose'
import { ChannelDocument } from '../types'
const { ObjectId } = Schema.Types

const schemaOptions = {
  toObject: { getters: true },
  toJSON: { getters: true },
  versionKey: false,
  timestamps: true,
}
const channelSchema = new Schema(
  {
    cid: { type: String },
    code: { type: String },
    ctime: { type: String },
    hlsPullUrl: { type: String },
    httpPullUrl: { type: String },
    img: { type: String },
    msg: { type: String },
    name: { type: String },
    product: { type: ObjectId, ref: 'Product' },
    products: [{ type: ObjectId, ref: 'Product' }],
    pushUrl: { type: String },
    requestId: { type: String },
    rtmpPullUrl: { type: String },
    scheduleDateTime: { type: Date, required: true },
    slug: { type: String },
    status: { type: String },
    title: { type: String },
    token: { type: String },
    user: { type: ObjectId, ref: 'User' },
    users: [{ type: ObjectId, ref: 'User' }],
    eventType: { type: Number },
    streamUrl: { type: String },
    channelName: { type: String },
    channelId: { type: String },
    taskId: { type: String },
    timestamp: { type: Number },
    videos: [{ type: ObjectId, ref: 'Video' }],
  },
  schemaOptions
)

export const Channel = mongoose.model<ChannelDocument>('Channel', channelSchema)
