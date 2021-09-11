import { gql } from 'apollo-server-express'

export default gql`
  extend type Query {
    couponsAdmin(
      page: Int
      search: String
      limit: Int
      sort: String
      store: ID
    ): couponRes @admin
    coupons(
      page: Int
      search: String
      limit: Int
      sort: String
      store: ID
    ): couponRes
    coupon(id: String!): Coupon
  }

  extend type Mutation {
    applyCoupon(code: String!): Cart
    removeCoupon: Cart @auth
    saveCoupon(
      id: String
      code: String!
      value: Int!
      type: String
      info: String
      msg: String
      text: String
      terms: String
      color: String
      minimumCartValue: Int
      amount: Int
      maxAmount: Int
      validFromDate: String
      validToDate: String
      active: Boolean
      store: ID
    ): OneCoupon @auth
    createCoupon(
      code: String!
      value: Int!
      type: String
      info: String
      msg: String
      text: String
      terms: String
      color: String
      minimumCartValue: Int
      amount: Int
      maxAmount: Int
      validFromDate: String
      validToDate: String
      active: Boolean
      store: ID
    ): OneCoupon @auth
  }

  type Coupon {
    id: ID!
    code: String
    value: Int
    type: String
    info: String
    msg: String
    text: String
    terms: String
    color: String
    minimumCartValue: Int
    amount: Float
    maxAmount: Int
    validFromDate: String
    validToDate: String
    active: Boolean
    store: Store
    createdAt: String!
    updatedAt: String!
  }

  type OneCoupon {
    id: ID!
    code: String
    value: Int
    type: String
    info: String
    msg: String
    text: String
    terms: String
    color: String
    minimumCartValue: Int
    amount: Float
    maxAmount: Int
    validFromDate: String
    validToDate: String
    active: Boolean
    store: ID
    createdAt: String!
    updatedAt: String!
  }

  type couponRes {
    data: [Coupon]
    count: Int
    pageSize: Int
    page: Int
  }
`
