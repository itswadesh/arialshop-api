import { gql } from 'apollo-server-express'

export default gql`
  extend type Query {
    globalOptionValues(
      page: Int
      search: String
      limit: Int
      sort: String
      global_option_id: ID
    ): globalOptionValueRes
    globalOptionValue(id: ID!): GlobalOptionValue
  }
  extend type Mutation {
    removeGlobalOptionValue(id: ID!): Boolean @auth
    saveGlobalOptionValue(
      id: String!
      global_option_id: ID
      name: String
      default: Boolean
      slug: String
      position: Int
      active: Boolean
    ): GlobalOptionValue @auth
  }

  type GlobalOptionValue {
    id: ID!
    global_option_id: ID!
    name: String
    default: Boolean
    slug: String
    active: Boolean
    position: Int
    createdAt: String!
    updatedAt: String!
  }

  type globalOptionValueRes {
    data: [GlobalOptionValue]
    count: Int
    pageSize: Int
    page: Int
  }
`
