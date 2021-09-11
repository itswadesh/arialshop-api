import { gql } from 'apollo-server-express'

export default gql`
  extend type Query {
    subscribes(
      page: Int
      search: String
      limit: Int
      sort: String
    ): subscribeRes
    mySubscribes(
      page: Int
      search: String
      limit: Int
      sort: String
    ): subscribeRes @auth
    subscribe(id: ID!): Subscribe
    isSubscribed(subscriptionId: ID): Boolean
  }
  extend type Mutation {
    buySubscription(subscriptionId: ID!): CashfreeRes @auth
  }

  type Subscribe {
    id: ID!
    amount: Float
    amountDue: Float
    amountPaid: Float
    daysLeft: Int
    EndTime: String
    EndTimeISO: String
    img: String
    onGoing: Boolean
    paid: Boolean
    payment: Payment
    StartTime: String
    StartTimeISO: String
    subscription: SaasSubscription
    user: User
    createdAt: String
    updatedAt: String
  }

  type OneSubscribe {
    id: ID!
    amount: Float
    amountDue: Float
    amountPaid: Float
    daysLeft: Int
    EndTime: String
    EndTimeISO: String
    img: String
    onGoing: Boolean
    paid: Boolean
    payment: ID
    StartTime: String
    StartTimeISO: String
    subscription: ID
    user: ID
    createdAt: String
    updatedAt: String
  }

  type subscribeRes {
    data: [Subscribe]
    count: Int
    pageSize: Int
    page: Int
  }
`
