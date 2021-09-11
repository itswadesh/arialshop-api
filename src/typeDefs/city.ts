import { gql } from 'apollo-server-express'

export default gql`
  extend type Query {
    cities(page: Int, search: String, limit: Int, sort: String): cityRes
    city(id: String!): City
  }
  extend type Mutation {
    removeCity(id: ID!): Boolean @auth
    saveCity(
      id: String
      name: String
      active: Boolean
      lat: Float
      lng: Float
      active: Boolean
    ): City @auth
  }

  type City {
    id: ID!
    name: String!
    lat: Float
    lng: Float
    user: User
    active: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  type cityRes {
    data: [City]
    count: Int
    pageSize: Int
    page: Int
  }
`
