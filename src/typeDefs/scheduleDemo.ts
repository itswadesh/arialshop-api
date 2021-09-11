import { gql } from 'apollo-server-express'

export default gql`
  extend type Query {
    scheduleDemos(
      page: Int
      skip: Int
      limit: Int
      search: String
      sort: String
      q: String
    ): ScheduleDemoRes
    myScheduleDemos(
      page: Int
      skip: Int
      limit: Int
      search: String
      sort: String
      q: String
    ): ScheduleDemoRes
    scheduleDemo(id: ID!): ScheduleDemo
  }

  extend type Mutation {
    saveScheduleDemo(
      id: String!
      title: String
      img: String
      product: ID
      products: [ID]
      scheduleDateTime: String
      users: [ID]
    ): ScheduleDemo

    deleteScheduleDemo(id: ID!): Boolean
  }

  type ScheduleDemo {
    id: ID!
    title: String
    img: String
    product: Product
    products: [Product]
    scheduleDateTime: Float!
    user: User!
    users: [User]
  }
  type ScheduleDemoRes {
    data: [ScheduleDemo]
    count: Int
    pageSize: Int
    page: Int
  }
  type ScheduleDemoOne {
    id: ID!
    title: String
    img: String
    product: ID
    products: [ID]
    scheduleDateTime: Float!
    user: ID!
    users: [ID]
  }
`
