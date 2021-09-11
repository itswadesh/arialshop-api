import { gql } from 'apollo-server-express'

export default gql`
  extend type Query {
    states(page: Int, search: String, limit: Int, sort: String): stateRes
    state(id: String, slug: String): State
  }

  extend type Mutation {
    saveState(
      id: String
      name: String
      slug: String
      value: String
      img: String
      flag: String
      code: String
      lang: String
      states: String
      sort: Int
      active: Boolean
    ): State @admin
    deleteState(id: ID!): Boolean @admin
  }

  type State {
    id: ID!
    name: String!
    slug: String
    value: String
    img: String
    flag: String
    code: String
    lang: String
    states: String
    sort: Int
    active: Boolean
    createdAt: String!
    updatedAt: String!
  }

  type stateRes {
    data: [State]
    count: Int
    pageSize: Int
    page: Int
  }
`
