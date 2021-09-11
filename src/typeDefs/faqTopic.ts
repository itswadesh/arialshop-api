import { gql } from 'apollo-server-express'

export default gql`
  extend type Query {
    faqTopics(
      page: Int
      search: String
      limit: Int
      sort: String
      type: String
      active: Boolean
    ): faqTopicRes
    faqTopic(id: String!): FaqTopic
  }

  extend type Mutation {
    saveFaqTopic(
      id: String!
      name: String
      for: String
      active: Boolean
    ): FaqTopic @auth
    deleteFaqTopic(id: ID!): Boolean @admin
  }

  type FaqTopic {
    id: ID!
    name: String
    slug: String
    for: String
    uid: ID
    q: String
    active: Boolean
    createdAt: String!
    updatedAt: String!
  }

  type faqTopicRes {
    data: [FaqTopic]
    count: Int
    pageSize: Int
    page: Int
  }
`
