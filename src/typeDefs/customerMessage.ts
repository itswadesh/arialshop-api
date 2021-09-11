import { gql } from 'apollo-server-express'

export default gql`
  extend type Query {
    customerMessages(
      page: Int
      search: String
      limit: Int
      sort: String
      store: ID
    ): CustomerMessageRes
    customerMessage(id: ID!): CustomerMessage
  }

  extend type Mutation {
    saveCustomerMessage(
      id: String!
      name: String
      email: String
      message: String
      store: ID
    ): OneCustomerMessage

    deleteCustomerMessage(id: ID!): Boolean
    deleteAllCustomerMessage: Boolean
  }

  type CustomerMessage {
    id: ID!
    name: String
    email: String
    message: String
    store: Store
  }

  type OneCustomerMessage {
    id: ID!
    name: String
    email: String
    message: String
    store: ID
  }

  type CustomerMessageRes {
    data: [CustomerMessage]
    count: Int
    pageSize: Int
    page: Int
  }
`
