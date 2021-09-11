import { gql } from 'apollo-server-express'

export default gql`
  extend type Query {
    optionValues(
      page: Int
      search: String
      limit: Int
      sort: String
      option_id: ID
    ): optionValueRes
    optionValue(id: ID!): OptionValue
  }
  extend type Mutation {
    removeOptionValue(id: ID!): Boolean @auth
    saveOptionValue(
      id: String!
      option_id: ID
      name: String
      default: Boolean
      type: String
      direction: String
      amount: Float
      slug: String
      position: Int
      active: Boolean
    ): OptionValue @auth
  }

  type OptionValue {
    id: ID!
    option_id: ID!
    name: String
    default: Boolean
    slug: String
    active: Boolean
    position: Int
    direction: String
    type: String
    amount: Float
    createdAt: String!
    updatedAt: String!
  }

  type optionValueRes {
    data: [OptionValue]
    count: Int
    pageSize: Int
    page: Int
  }
`
