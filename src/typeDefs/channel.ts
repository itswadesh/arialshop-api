import { gql } from 'apollo-server-express'

export default gql`
  extend type Query {
    channels(
      page: Int
      skip: Int
      limit: Int
      search: String
      sort: String
      user: ID
      q: String
    ): ChannelRes
    myChannels(
      page: Int
      skip: Int
      limit: Int
      search: String
      sort: String
      q: String
    ): ChannelRes
    fetchVimeo: String
    channel(id: ID!): Channel
    channel1(id: ID!): ChannelOne
    channelList: [ChannelList]
    zego: Zego
    zegoWhiteBoard: Zego
    neteaseToken(channel: String): AppKeyAndToken
    getNeteaseChannel: Channel @vendor
    getAllStoredVideos: neteaseVideoRes
  }

  extend type Mutation {
    saveChannel(
      id: String!
      title: String
      img: String
      product: ID
      products: [ID]
      scheduleDateTime: String
      users: [ID]
    ): Channel

    deleteChannel(id: ID!): Boolean

    rtcToken(channel: String, isPublisher: Boolean): tokenRes
    pushToNeteaseCDN(
      cname: String
      cid: Int
      taskId: String
      streamUrl: String
      layout: String
      record: Boolean
      version: Float
    ): Boolean
  }

  type AppKeyAndToken {
    uid: Int
    appkey: String
    token: String
  }
  type Zego {
    appID: Float
    server: String
    roomID: String
    token: String
    userID: String
    userName: String
  }
  type Channel {
    id: ID!
    title: String
    img: String
    product: Product
    products: [Product]
    scheduleDateTime: Float
    user: User
    users: [User]
    requestId: String # from here ChannelInfo
    cid: String
    ctime: String
    pushUrl: String
    httpPullUrl: String
    hlsPullUrl: String
    rtmpPullUrl: String
    name: String
    code: String
    msg: String
  }

  type ChannelRes {
    data: [Channel]
    count: Int
    pageSize: Int
    page: Int
  }
  type ChannelOne {
    id: ID!
    title: String
    img: String
    product: ID
    products: [ID]
    scheduleDateTime: Float
    user: ID!
    users: [ID]
    requestId: String # from here ChannelInfo
    cid: String
    ctime: String
    pushUrl: String
    httpPullUrl: String
    hlsPullUrl: String
    rtmpPullUrl: String
    name: String
    code: String
    msg: String
  }

  type neteaseVideoRes {
    pageSize: Int
    totalRecords: Int
    currentPage: Int
    pageNum: Int
    data: [NeteaseVideo]
  }

  type NeteaseVideo {
    createTime: String
    origUrl: String
    playSupport: Int
    downloadOrigUrl: String
    videoName: String
    vid: String
    durationMsec: Int
    status: Int
    updateTime: String
    typeName: String
    duration: Int
    snapshotUrl: String
    initialSize: Int
    typeId: Int
  }

  type tokenRes {
    uid: String
    token: String
    channel: String
  }

  type ChannelList {
    channel_name: String
    user_count: Int
    user: User
  }
`
