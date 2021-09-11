import { gql } from 'apollo-server-express'

export default gql`
  extend type Query {
    units(
      page: Int
      search: String
      limit: Int
      sort: String
      store: ID
    ): unitRes
    unit(id: ID!): Unit
  }
  extend type Mutation {
    removeUnit(id: ID!): Boolean @auth
    saveUnit(
      id: String!
      name: String
      slug: String
      info: String
      img: String
      store: ID
      featured: Boolean
      active: Boolean
    ): OneUnit @auth
  }

  type Unit {
    id: ID!
    name: String
    slug: String
    info: String
    img: String
    store: Store
    featured: Boolean
    active: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  type OneUnit {
    id: ID!
    name: String
    slug: String
    info: String
    img: String
    store: ID
    featured: Boolean
    active: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  type unitRes {
    data: [Unit]
    count: Int
    pageSize: Int
    page: Int
  }
`
