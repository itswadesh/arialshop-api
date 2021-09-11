import { gql } from 'apollo-server-express'

export default gql`
  extend type Query {
    importDetails(
      importNo: String
      type: String
      success: String
      page: Int
      search: String
      where: String
      limit: Int
      sort: String
    ): importDetailRes
  }

  extend type Mutation {
    deleteImportDetails(type: String!): Int
  }

  type ImportDetail {
    id: ID!
    importNo: String
    rawNo: Int
    totalItems: Int
    message: String
    fileName: String
    type: String
    success: Boolean
    # data: Product
    user: ID
  }
  type importDetailRes {
    data: [ImportDetail]
    count: Int
    pageSize: Int
    page: Int
  }
`
