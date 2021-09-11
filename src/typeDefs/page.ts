import { gql } from 'apollo-server-express'

export default gql`
  extend type Query {
    pages(page: Int, search: String, limit: Int, sort: String): pageRes
    page(id: String): Page
    pageSlug(slug: String): Page
  }

  extend type Mutation {
    removePage(id: ID!): Boolean @auth
    savePage(
      id: String
      name: String
      title: String
      slug: String
      description: String
      content: String
      menuTitle: String
      active: Boolean
    ): Page @auth
  }

  type Page {
    id: ID!
    name: String
    title: String
    slug: String
    description: String
    content: String
    menuTitle: String
    user: User
    active: Boolean
    createdAt: String!
    updatedAt: String!
  }

  type pageRes {
    data: [Page]
    count: Int
    pageSize: Int
    page: Int
  }
`
