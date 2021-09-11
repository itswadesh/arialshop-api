import { gql } from 'apollo-server-express'

export default gql`
  extend type Query {
    gListProduct(authCode: String!): [Product]
    gGetProduct(productId: ID!, authCode: String!): Product
    fbListProduct: [FBProduct]
    fbProduct(fbProductId: String!): FBProduct
  }

  extend type Mutation {
    gInsertProduct(productId: ID!, authCode: String!): Boolean @admin
    gDeleteProduct(productId: ID!, authCode: String!): Boolean @admin
    SyncProductsToGoogle(
      authCode: String!
      category: String
      batchId: String!
      contentLanguage: String
      targetCountry: String
    ): Int @admin
    # FACEBOOK
    fbInsertProduct(productId: ID!): Boolean @admin
    SyncProductsToFacebook: Int @admin
    fbDeleteProduct(productId: String!): Boolean
  }

  type FBProduct {
    id: String
    name: String
    age_group: String
    availability: String
    brand: String
    category: String
    condition: String
    currency: String
    description: String
    gender: String
    image_url: String
    price: String
    retailer_id: String
    retailer_product_group_id: String
    url: String
  }
`
