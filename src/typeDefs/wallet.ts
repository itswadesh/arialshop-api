import { gql } from 'apollo-server-express'

export default gql`
  extend type Query {
    allTransactions(
      page: Int
      skip: Int
      limit: Int
      search: String
      sort: String
      q: String
    ): WalletRes
    myTransactions(
      page: Int
      skip: Int
      limit: Int
      search: String
      sort: String
      q: String
    ): WalletRes
    transaction(walletId: String!): Wallet
  }

  extend type Mutation {
    addMoney(amount: Int): Wallet @admin @demo
  }

  type Wallet {
    id: ID!
    direction: String
    remark: String
    amount: Int
    balance: Int
    user: ID
    referedUser: ID
    createdAt: String
    updatedAt: String
  }
  type WalletRes {
    data: [Wallet]
    count: Int
    pageSize: Int
    page: Int
  }
`
