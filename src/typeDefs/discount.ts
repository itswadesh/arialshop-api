import { gql } from 'apollo-server-express'

export default gql`
  extend type Query {
    discounts(page: Int, search: String, limit: Int, sort: String): discountRes
    discount(id: ID!): Discount
  }
  extend type Mutation {
    deleteDiscount(id: ID!): Boolean @auth
    saveDiscount(
      id: String!
      active: Boolean
      amount: Float
      applyOn: String
      description: String
      img: String
      name: String
      q: String
      ruleType: String
      type: String
      maximumUsage: Int
      startDate: String
      endDate: String
      numberOfTimeUsed: Int
      seller: ID
    ): Discount @auth
  }

  type Discount {
    id: ID!
    active: Boolean
    amount: Float
    applyOn: String
    description: String
    img: String
    name: String
    q: String
    ruleType: String
    slug: String
    type: String
    #  In case of advance settings
    maximumUsage: Int
    startDate: String
    endDate: String
    numberOfTimeUsed: Int
    seller: User
  }

  type discountRes {
    data: [Discount]
    count: Int
    pageSize: Int
    page: Int
  }
`
