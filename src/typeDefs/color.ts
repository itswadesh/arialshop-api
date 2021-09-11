import { gql } from 'apollo-server-express'

export default gql`
  extend type Query {
    colors(
      page: Int
      search: String
      limit: Int
      sort: String
      store: ID
    ): colorRes
    color(id: ID!): Color
  }
  extend type Mutation {
    removeColor(id: ID!): Boolean @auth
    saveColor(
      id: String!
      name: String
      val: String
      color_code: String
      slug: String
      info: String
      featured: Boolean
      active: Boolean
      store: ID
    ): OneColor @auth
  }

  type Color {
    id: ID!
    name: String
    val: String
    color_code: String
    slug: String
    info: String
    featured: Boolean
    active: Boolean
    store: Store
    createdAt: String!
    updatedAt: String!
  }
  type OneColor {
    id: ID!
    name: String
    val: String
    color_code: String
    slug: String
    info: String
    featured: Boolean
    active: Boolean
    store: ID
    createdAt: String!
    updatedAt: String!
  }
  type colorRes {
    data: [Color]
    count: Int
    pageSize: Int
    page: Int
  }
`
