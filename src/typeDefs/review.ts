import { gql } from 'apollo-server-express'

export default gql`
  extend type Query {
    reviews(
      page: Int
      skip: Int
      limit: Int
      search: String
      sort: String
      q: String
      store: ID
    ): ReviewRes @vendor
    reviewSummary(pid: ID!): ReviewSummary
    productReviews(
      pid: ID!
      page: Int
      skip: Int
      limit: Int
      search: String
      sort: String
      active: Boolean
      q: String
    ): ReviewRes
    review(id: ID!): Review
  }

  extend type Mutation {
    removeReview(id: ID!): Boolean @auth
    saveReview(
      id: String!
      pid: ID
      variant: ID
      user: ID
      store: ID
      rating: Int
      message: String
      active: Boolean
    ): OneReview @auth
  }

  type ReviewSummary {
    avg: Float
    count: Float
    total: Float
    reviews: [String]
  }

  type ReviewRes {
    data: [Review]
    count: Int
    pageSize: Int
    page: Int
    total: Float
    avg: Float
  }

  type Review {
    id: ID!
    pid: Product
    variant: Variant
    user: User
    vendor: User
    message: String
    votes: Vote
    rating: Float
    store: Store
    active: Boolean
    createdAt: String!
    updatedAt: String!
  }

  type OneReview {
    id: ID!
    pid: ID
    variant: ID
    user: ID
    vendor: ID
    message: String
    votes: Vote
    rating: Float
    store: ID
    active: Boolean
    createdAt: String!
    updatedAt: String!
  }

  type Vote {
    count: Float!
    voters: [User!]!
  }
`
