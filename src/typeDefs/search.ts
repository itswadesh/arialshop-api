import { gql } from 'apollo-server-express'

export default gql`
  extend type Query {
    popularSearches(
      page: Int
      search: String
      limit: Int
      sort: String
      store: ID
    ): PopularSearchRes
    popularSearch(id: ID!): PopularSearch
  }

  extend type Mutation {
    savePopularSearch(
      id: String!
      text: String
      popularity: String
      store: ID
    ): OnePopularSearch @vendor

    deletePopularSearch(id: ID!): Boolean
    deleteAllPopularSearch: Int
  }

  type PopularSearch {
    id: ID!
    text: String
    popularity: String
    store: Store
  }

  type OnePopularSearch {
    id: ID!
    text: String
    popularity: String
    store: ID
  }

  type PopularSearchRes {
    data: [PopularSearch]
    count: Int
    pageSize: Int
    page: Int
  }
`
