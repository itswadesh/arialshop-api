import { gql } from 'apollo-server-express'

export default gql`
  extend type Query {
    emailTemplates(
      page: Int
      search: String
      limit: Int
      sort: String
      store: ID
    ): emailTemplateRes
    # emailTemplates(folder: String, name: String): String
    emailTemplate(id: ID!): EmailTemplate
  }

  extend type Mutation {
    deleteEmailTemplate(id: ID!): Boolean @auth
    saveEmailTemplate(
      id: String!
      name: String
      title: String
      description: String
      content: String
      active: Boolean
      store: ID
    ): OneEmailTemplate @auth
  }

  type EmailTemplate {
    id: String
    name: String
    title: String
    description: String
    content: String
    link: String
    user: User
    store: Store
    active: Boolean
    createdAt: String!
    updatedAt: String!
  }
  type OneEmailTemplate {
    id: String
    name: String
    title: String
    description: String
    content: String
    link: String
    user: ID
    store: ID
    active: Boolean
    createdAt: String!
    updatedAt: String!
  }

  type emailTemplateRes {
    data: [EmailTemplate]
    count: Int
    pageSize: Int
    page: Int
  }
`
