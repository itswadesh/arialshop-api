import { gql } from 'apollo-server-express'

export default gql`
  extend type Query {
    wishlists(
      page: Int
      search: String
      limit: Int
      sort: String
      store: ID
    ): wishlistRes @vendor
    myWishlist(
      page: Int
      search: String
      limit: Int
      sort: String
      store: ID
    ): wishlistRes @auth
    checkWishlist(product: ID!, variant: ID!): Boolean
  }
  extend type Mutation {
    toggleWishlist(product: ID!, variant: ID!): Boolean @auth
  }

  type Wishlist {
    id: ID
    product: Product
    variant: Product
    user: User
    store: Store
    active: Boolean
    createdAt: String
    updatedAt: String
  }

  type OneWishlist {
    id: ID
    product: Product
    variant: Product
    user: ID
    store: ID
    active: Boolean
    createdAt: String
    updatedAt: String
  }

  type wishlistRes {
    data: [Wishlist]
    count: Int
    pageSize: Int
    page: Int
  }
`
