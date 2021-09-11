import mongoose, { Schema } from 'mongoose'
import { VideoDocument } from '../types'
const { ObjectId } = Schema.Types

const schemaOptions = {
  toObject: { getters: true },
  toJSON: { getters: true },
  versionKey: false,
  timestamps: true,
}
const videoSchema = new Schema(
  {
    vid: { type: String, unique: true },
    taskId: { type: String, unique: true },
    eventType: { type: String },
    cid: { type: String },
    code: { type: String },
    pieceIndex: { type: Number },
    type: { type: String },
    url: { type: String },
    uid: { type: Number },
    filename: { type: String },
    size: { type: String },
    channelName: { type: String },
    mix: { type: Boolean },
    channelId: { type: Number },
    md5: { type: String },
    timestamp: { type: Number },
    substream: { type: Boolean },
    reason: { type: String },
    streamUrl: { type: String },
    // This will be populated from videolist api
    createTime: { type: Number },
    origUrl: { type: String },
    playSupport: { type: String },
    downloadOrigUrl: { type: String },
    videoName: { type: String },
    durationMsec: { type: String },
    status: { type: Number },
    updateTime: { type: Number },
    typeName: { type: String },
    duration: { type: Number },
    snapshotUrl: { type: String },
    initialSize: { type: String },
    typeId: { type: Number },
    shdMp4Url: { type: String },
    sdMp4Size: { type: Number },
    downloadSdMp4Url: { type: String },
    description: { type: String },
    hdMp4Size: { type: Number },
    downloadSdFlvUrl: { type: String },
    shdMp4Size: { type: Number },
    sdFlvUrl: { type: String },
    sdFlvSize: { type: Number },
    hdMp4Url: { type: String },
    sdMp4Url: { type: String },
    downloadHdMp4Url: { type: String },
    downloadShdMp4Url: { type: String },
    completeTime: { type: Number },
    title: { type: String },
    products: [{ type: ObjectId, ref: 'Product' }],
    user: { type: ObjectId, ref: 'User' },
    channel: { type: ObjectId, ref: 'Channel' },
  },
  schemaOptions
)

export const Video = mongoose.model<VideoDocument>('Video', videoSchema)
