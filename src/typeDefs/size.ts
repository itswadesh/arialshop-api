import { gql } from 'apollo-server-express'

export default gql`
  extend type Query {
    sizes(
      page: Int
      search: String
      limit: Int
      sort: String
      store: ID
    ): sizeRes
    size(id: ID!): Size
  }
  extend type Mutation {
    removeSize(id: ID!): Boolean @auth
    saveSize(
      id: String!
      name: String
      slug: String
      info: String
      img: String
      store: ID
      sort: Float
      featured: Boolean
      active: Boolean
    ): OneSize @auth
  }

  type Size {
    id: ID!
    name: String
    slug: String
    info: String
    img: String
    store: Store
    sort: Float
    featured: Boolean
    active: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  type OneSize {
    id: ID!
    name: String
    slug: String
    info: String
    img: String
    store: ID
    sort: Float
    featured: Boolean
    active: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  type sizeRes {
    data: [Size]
    count: Int
    pageSize: Int
    page: Int
  }
`
