import { gql } from 'apollo-server-express'

export default gql`
  extend type Query {
    attributes(
      page: Int
      search: String
      limit: Int
      sort: String
      store: ID
    ): attributeRes
    attribute(id: ID!): Attribute
    categoryAttributes(category: ID!): attributeRes
  }
  extend type Mutation {
    removeAttribute(id: ID!): Boolean @auth
    saveAttribute(
      id: String
      name: String
      category: ID
      show: Boolean
      active: Boolean
      store: ID
    ): Attribute @auth
    importAttribute(file: Upload!): Boolean
  }

  type Attribute {
    id: ID!
    name: String
    category: String
    show: Boolean
    active: Boolean
    createdAt: String
    updatedAt: String
    store: ID
  }

  type attributeRes {
    data: [Attribute]
    count: Int
    pageSize: Int
    page: Int
  }
`
