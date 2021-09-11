import { gql } from 'apollo-server-express'

export default gql`
  extend type Query {
    shippingMethods(
      page: Int
      skip: Int
      limit: Int
      search: String
      sort: String
      q: String
    ): ShippingMethodRes
    shippingMethod(id: ID!): ShippingMethod
  }

  extend type Mutation {
    saveShippingMethod(
        id: String!
        carrierName: String
        method: String
        shippingNameAtCheckout: String
        minWeight: Float
        maxWeight: Float
        amount: Float
        tableBasedOn: String
    ): ShippingMethod
    removeShippingMethod(id: ID!): Boolean

  }
 
  type ShippingMethod {
    id: ID!
    carrierName: String
    method: String
    shippingNameAtCheckout: String
    minWeight: Float
    maxWeight: Float
    amount: Float
    tableBasedOn: String
    user: ID
  }
  type ShippingMethodRes {
    data: [ShippingMethod]
    count: Int
    pageSize: Int
    page: Int
  }

`