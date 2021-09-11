import { gql } from 'apollo-server-express'

export default gql`
  extend type Query {
    tokens(
      page: Int
      search: String
      limit: Int
      sort: String
      user_type: String
    ): fcmTokenRes
    myTokens(page: Int, search: String, limit: Int, sort: String): fcmTokenRes
      @auth
  }

  extend type Mutation {
    saveFcmToken(
      id: String!
      token: String
      platform: String
      device_id: String
      active: Boolean
    ): FcmToken
    notifyFirebase(
      id: String
      token: String
      platform: String
      device_id: String
      user_type: String
      active: Boolean
    ): FcmToken
    deleteFcmToken(id: ID!): Boolean
  }

  type FcmToken {
    id: ID!
    token: String
    platform: String
    device_id: String
    user_type: String
    sId: String
    user: User
    active: Boolean
    createdAt: String!
    updatedAt: String!
  }

  type fcmTokenRes {
    data: [FcmToken]
    count: Int
    pageSize: Int
    page: Int
  }
`
