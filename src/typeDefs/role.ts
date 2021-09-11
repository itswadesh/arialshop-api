import { gql } from 'apollo-server-express'

export default gql`
  extend type Query {
    roles(page: Int, search: String, limit: Int, sort: String): roleRes
    role(id: ID!): Role
  }
  extend type Mutation {
    deleteRole(id: ID!): Boolean @auth
    saveRole(id: String!, name: String, roles: [String], active: Boolean): Role
      @auth
    assignRole(userId: ID!, roleIds: [ID!]!): User @admin
  }

  type Role {
    id: ID!
    name: String
    roles: [String]
  }

  type roleRes {
    data: [Role]
    count: Int
    pageSize: Int
    page: Int
  }
`
