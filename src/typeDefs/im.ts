import { gql } from 'apollo-server-express'

export default gql`
  extend type Query {
    channelMessages(
      channel: String!
      page: Int
      search: String
      limit: Int
      sort: String
    ): InstantMessageRes
  }

  extend type Subscription {
    messageReceived(channel: String!): InstantMessage
    chats(
      channel: String!
      page: Int
      search: String
      limit: Int
      sort: String
    ): InstantMessageRes
  }

  extend type Mutation {
    sendInstantMessage(channel: String!, message: String): InstantMessage @auth
  }

  type InstantMessage {
    id: ID!
    channel: String
    message: String
    uid: String
    firstName: String
    lastName: String
    user: User
  }
  type InstantMessageRes {
    data: [InstantMessage]
    count: Int
    pageSize: Int
    page: Int
  }
`
