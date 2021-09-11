import { gql } from 'apollo-server-express'

export default gql`
  extend type Query {
    faqs(
      page: Int
      search: String
      limit: Int
      sort: String
      type: String
      active: Boolean
      store: ID
    ): faqRes
    faq(id: String!): Faq
  }

  extend type Mutation {
    saveFaq(
      id: String!
      question: String
      topic: String
      answer: String
      active: Boolean
      store: ID
    ): OneFaq @auth
    deleteFaq(id: ID!): Boolean @admin
  }

  type Faq {
    id: ID!
    question: String
    topic: String
    answer: String
    active: Boolean
    store: Store
    createdAt: String!
    updatedAt: String!
  }

  type OneFaq {
    id: ID!
    question: String
    topic: String
    answer: String
    active: Boolean
    store: ID
    createdAt: String!
    updatedAt: String!
  }
  type faqRes {
    data: [Faq]
    count: Int
    pageSize: Int
    page: Int
  }
`
