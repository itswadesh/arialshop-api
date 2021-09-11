import { gql } from 'apollo-server-express'

export default gql`
  extend type Query {
    deals(
      page: Int
      skip: Int
      limit: Int
      search: String
      sort: String
      active: Boolean
      store: ID
    ): DealRes
    listDeals(
      page: Int
      skip: Int
      limit: Int
      search: String
      sort: String
      active: Boolean
      store: ID
    ): DealRes
    deal(id: ID!): Deal @auth
    startDeal(id: ID!): Boolean @auth
    endDeal(id: ID!): Boolean @auth
    dealOne(id: ID!): DealOne @auth
  }
  extend type Mutation {
    createDeal(
      name: String
      startTime: String
      endTime: String
      startTimeISO: String
      endTimeISO: String
      onGoing: Boolean
      products: [String]
      dealStatus: Boolean
      active: Boolean
      store: ID
    ): DealOne @admin
    updateDeal(
      id: ID!
      name: String
      startTime: String
      endTime: String
      startTimeISO: String
      endTimeISO: String
      onGoing: Boolean
      products: [String]
      dealStatus: Boolean
      active: Boolean
      store: ID
    ): DealOne @admin
    saveDeal(
      id: ID
      name: String
      img: String
      startTime: String
      endTime: String
      startTimeISO: String
      endTimeISO: String
      onGoing: Boolean
      products: [String]
      dealStatus: Boolean
      active: Boolean
      store: ID
    ): DealOne @admin
    removeDeal(id: ID!): Boolean @admin
  }

  type DealRes {
    data: [Deal]
    count: Int
    pageSize: Int
    page: Int
  }

  type DealOne {
    id: String!
    name: String
    img: String
    startTime: String
    endTime: String
    startTimeISO: String
    endTimeISO: String
    onGoing: Boolean
    products: [ID]
    dealStatus: Boolean
    active: Boolean
    store: ID
  }
  type Deal {
    id: String!
    name: String
    img: String
    startTime: String
    endTime: String
    startTimeISO: String
    endTimeISO: String
    onGoing: Boolean
    products: [Product]
    dealStatus: Boolean
    active: Boolean
    store: Store
  }
`
