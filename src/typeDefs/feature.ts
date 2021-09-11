import { gql } from 'apollo-server-express'

export default gql`
  extend type Query {
    features(
      page: Int
      search: String
      limit: Int
      sort: String
      store: ID
    ): featureRes
    feature(id: String!): Feature
    productFeatures(product: ID!): featureRes
  }
  extend type Mutation {
    removeFeature(id: ID!): Boolean @auth
    saveFeature(
      id: String
      name: String
      value: String
      type: String
      product: ID
      store: ID
      active: Boolean
    ): OneFeature @auth
  }

  type Feature {
    id: ID!
    name: String
    value: String
    slug: String
    type: String
    product: ID
    store: Store
    active: Boolean
    createdAt: String!
    updatedAt: String!
  }

  type OneFeature {
    id: ID!
    name: String
    value: String
    slug: String
    type: String
    product: ID
    store: ID
    active: Boolean
    createdAt: String!
    updatedAt: String!
  }

  type featureRes {
    data: [Feature]
    count: Int
    pageSize: Int
    page: Int
  }
`
