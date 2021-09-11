import { gql } from 'apollo-server-express'

export default gql`
  extend type Query {
    slots(
      page: Int
      skip: Int
      limit: Int
      search: String
      sort: String
      store: ID
    ): SlotRes
    slot(id: String!): Slot @auth
  }

  extend type Mutation {
    removeSlot(id: ID!): Boolean @auth
    saveSlot(
      id: String!
      name: String
      val: String
      store: ID
      slug: String
      info: String
      active: Boolean
    ): OneSlot @auth
  }

  type Slot {
    id: ID!
    name: String
    val: String
    slug: String
    info: String
    uid: User
    store: Store
    active: Boolean
    createdAt: String!
    updatedAt: String!
  }

  type OneSlot {
    id: ID!
    name: String
    val: String
    slug: String
    info: String
    uid: ID
    store: ID
    active: Boolean
    createdAt: String!
    updatedAt: String!
  }

  type SlotRes {
    data: [Slot]
    count: Int
    pageSize: Int
    page: Int
  }
`
