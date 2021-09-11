import { gql } from 'apollo-server-express'

export default gql`
  extend type Query {
    collections(
      page: Int
      search: String
      limit: Int
      sort: String
      active: Boolean
      store: ID
    ): collectionRes
    collection(id: ID!): CollectionOne
    collectionsProducts(ids: [ID!]): SearchRes
  }

  extend type Mutation {
    saveCollection(
      id: String!
      name: String
      products: [ID]
      description: String
      active: Boolean
      images: [String]
      img: String
      q: String
      sort: String
      type: String
      store: ID
    ): Collection
    deleteCollection(id: ID!): Boolean
  }

  type Collection {
    id: ID!
    name: String
    products: [ID]
    description: String
    active: Boolean
    images: [String]
    img: String
    q: String
    sort: String
    type: String
    user: User
    store: Store
    createdAt: String
    updatedAt: String
  }
  type CollectionOne {
    id: ID!
    name: String
    products: [Product]
    description: String
    active: Boolean
    images: [String]
    img: String
    q: String
    sort: String
    type: String
    user: User
    store: Store
    createdAt: String
    updatedAt: String
  }

  type collectionRes {
    data: [CollectionOne]
    count: Int
    pageSize: Int
    page: Int
  }
`
