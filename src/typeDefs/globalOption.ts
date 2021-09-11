import { gql } from 'apollo-server-express'

export default gql`
  extend type Query {
    globalOptions(
      page: Int
      search: String
      limit: Int
      sort: String
    ): globalOptionRes
    globalOption(id: ID!): GlobalOption
  }
  extend type Mutation {
    removeGlobalOption(id: ID!): Boolean @auth
    saveGlobalOption(
      id: String!
      name: String
      key: String
      val: String
      categories: [String]
      position: Int
      slug: String
      info: String
      isFilter: Boolean
      preselect: Boolean
      required: Boolean
      type: String
      active: Boolean
    ): GlobalOption @auth
  }

  type GlobalOption {
    id: ID!
    name: String
    key: String
    val: String
    categories: [String]
    values: [GlobalOptionValue]
    position: Int
    slug: String
    info: String
    isFilter: String
    active: Boolean
    required: Boolean
    preselect: Boolean
    type: String
    createdAt: String!
    updatedAt: String!
  }

  type globalOptionRes {
    data: [GlobalOption]
    count: Int
    pageSize: Int
    page: Int
  }
`
