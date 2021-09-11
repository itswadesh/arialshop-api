import { gql } from 'apollo-server-express'

export default gql`
  extend type Query {
    orderStatus(id: ID!): OrderStatusRes
    orderStatusOfOrder(order_id: ID!): [OrderStatusRes]
  }

  extend type Mutation {
    removeOrderStatus(id: ID!): Boolean @auth
    saveOrderStatus(
      id: String!
      order: ID
      item: ID
      event: String
      tracking_id: String
      type: String
      courier_name: String
      active: Boolean
    ): OrderStatusRes @auth
  }

  type OrderStatusRes {
    id: ID!
    order: ID
    item: ID
    event: String
    tracking_id: String
    type: String
    courier_name: String
    user: ID
    active: Boolean!
    createdAt: String!
    updatedAt: String!
  }
`
