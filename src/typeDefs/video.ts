import { gql } from 'apollo-server-express'

export default gql`
  extend type Query {
    videos(
      page: Int
      skip: Int
      search: String
      category: String
      subject: String
      limit: Int
      sort: String
    ): videoRes
    myVideos(
      page: Int
      search: String
      category: String
      subject: String
      limit: Int
      sort: String
    ): videoRes @auth
    video(id: String, slug: String): Video
    videosByIds(ids: [ID!]): [Video]
  }

  extend type Mutation {
    saveVideo(
      id: String
      videoId: String
      url: String
      name: String
      description: String
      comment: String
      category: String
      board: ID
      level: ID
      class: ID
      subject: ID
      lang: String
      difficulty: String
      chapter: String
      type: String
      img: String
      slug: String
      sort: Int
      featured: Boolean
      user: ID
      active: Boolean
      status: String
      meta: String
      metaTitle: String
      metaDescription: String
      metaKeywords: String
    ): Video @auth
    deleteVideo(id: ID!): Boolean @auth
    video(id: ID, slug: String): Video
  }

  type Video {
    id: ID!
    comment: String
    category: String
    img: String
    sort: Int
    featured: Boolean
    user: User
    active: Boolean
    views: Int
    vid: String
    taskId: String
    eventType: String
    cid: String
    code: String
    pieceIndex: Int
    type: String
    url: String
    uid: Float
    filename: String
    size: String
    channelName: String
    mix: String
    channelId: Float
    md5: String
    timestamp: Float
    substream: Boolean
    reason: String
    streamUrl: String
    createTime: Float
    origUrl: String
    playSupport: String
    downloadOrigUrl: String
    videoName: String
    durationMsec: String
    status: Float
    updateTime: Float
    typeName: String
    duration: Int
    snapshotUrl: String
    initialSize: String
    typeId: Float
    shdMp4Url: String
    sdMp4Size: Float
    downloadSdMp4Url: String
    description: String
    hdMp4Size: Float
    downloadSdFlvUrl: String
    shdMp4Size: Float
    sdFlvUrl: String
    sdFlvSize: Float
    hdMp4Url: String
    sdMp4Url: String
    downloadHdMp4Url: String
    downloadShdMp4Url: String
    completeTime: Float

    createdAt: String
    updatedAt: String
  }

  type videoRes {
    data: [Video]
    count: Int
    pageSize: Int
    page: Int
  }
`
