import { gql } from 'apollo-server-express'

export default gql`
  extend type Query {
    countries(page: Int, search: String, limit: Int, sort: String): countryRes
    country(id: String, slug: String): Country
  }

  extend type Mutation {
    saveCountry(
      id: String
      name: String
      slug: String
      value: String
      dialCode: String
      code: String
      img: String
      flag: String
      lang: String
      sort: Int
      active: Boolean
    ): Country @admin
    deleteCountry(id: ID!): Boolean @admin
  }

  type Country {
    id: ID!
    name: String!
    slug: String
    value: String
    img: String
    flag: String
    dialCode: String
    code: String
    lang: String
    states: [State]
    sort: Int
    active: Boolean
    createdAt: String!
    updatedAt: String!
  }

  type countryRes {
    data: [Country]
    count: Int
    pageSize: Int
    page: Int
  }
`
