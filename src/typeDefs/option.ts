import { gql } from 'apollo-server-express'

export default gql`
  extend type Query {
    options(pid: ID!, store: ID): optionRes
    option(id: ID!): Option
  }
  extend type Mutation {
    removeOption(id: ID!): Boolean @auth
    saveOption(
      id: String
      pid: ID
      name: String
      key: String
      val: String
      categories: [String]
      position: Int
      slug: String
      info: String
      isFilter: Boolean
      preselect: Boolean
      required: Boolean
      type: String
      default_option: ID
      active: Boolean
      store: ID
    ): Option @auth
  }

  input ValueIp {
    id: String
    name: String
    default: Boolean
    slug: String
    position: Int
  }

  type Option {
    id: ID!
    pid: ID!
    name: String
    key: String
    val: String
    categories: [String]
    values: [OptionValue]
    position: Int
    slug: String
    info: String
    isFilter: String
    active: Boolean
    required: Boolean
    preselect: Boolean
    type: String
    default_option: ID
    store: ID
    createdAt: String!
    updatedAt: String!
  }

  input OptionIp {
    id: ID
    name: String
    key: String
    val: String
    categories: [String]
    values: [ValueIp]
    position: Int
    slug: String
    info: String
    isFilter: String
    active: Boolean
    required: Boolean
    preselect: Boolean
    type: String
  }

  type optionRes {
    data: [Option]
    count: Int
    pageSize: Int
    page: Int
  }
`
