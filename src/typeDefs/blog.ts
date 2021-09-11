import { gql } from 'apollo-server-express'

export default gql`
  extend type Query {
    blogs(
      page: Int
      search: String
      limit: Int
      sort: String
      type: String
      active: Boolean
      store: ID
    ): blogRes
    blog(id: String!): Blog
  }

  extend type Mutation {
    saveBlog(
      id: String!
      title: String
      slug: String
      excerpt: String
      content: String
      published_at: String
      tags: [String]
      img: String
      status: String
      active: Boolean
      store: ID
    ): OneBlog @auth
    deleteBlog(id: ID!): Boolean @admin
  }

  type Blog {
    id: ID!
    title: String
    slug: String
    excerpt: String
    content: String
    published_at: String
    tags: [String]
    img: String
    status: String
    active: Boolean
    user: User
    store: Store
    createdAt: String!
    updatedAt: String!
  }

  type OneBlog {
    id: ID!
    title: String
    slug: String
    excerpt: String
    content: String
    published_at: String
    tags: [String]
    img: String
    status: String
    active: Boolean
    user: ID
    store: ID
    createdAt: String!
    updatedAt: String!
  }

  type blogRes {
    data: [Blog]
    count: Int
    pageSize: Int
    page: Int
  }
`
