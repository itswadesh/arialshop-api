import { gql } from 'apollo-server-express'

export default gql`
  extend type Query {
    brands(
      page: Int
      search: String
      limit: Int
      sort: String
      featured: Boolean
      parent: String
      store: ID
    ): brandRes
    parentBrands(
      page: Int
      search: String
      limit: Int
      sort: String
      featured: Boolean
    ): brandRes
    brand(id: String, slug: String): Brand #with populated fields
    brand1(id: String, slug: String): OneBrand
    # @brandQuery #without populated fields
  }

  extend type Mutation {
    saveBrand(
      id: String!
      brandId: String
      name: String
      slug: String
      parent: ID
      img: String
      info: String
      meta: String
      metaTitle: String
      metaDescription: String
      metaKeywords: String
      position: Int
      facebookUrl: String
      twitterUrl: String
      linkedinUrl: String
      youtubeUrl: String
      pinterestUrl: String
      googleUrl: String
      instaUrl: String
      featured: Boolean
      active: Boolean
      store: ID
    ): OneBrand
    # @brandSave
    deleteBrand(id: ID!): Boolean @admin
    syncBrands: Int @admin
  }

  type Brand {
    id: ID!
    brandId: String
    name: String
    slug: String
    position: Int
    info: String
    meta: String
    metaTitle: String
    metaDescription: String
    metaKeywords: String
    img: String
    featured: Boolean
    user: User
    sizechart: String
    facebookUrl: String
    twitterUrl: String
    linkedinUrl: String
    youtubeUrl: String
    instaUrl: String
    pinterestUrl: String
    googleUrl: String
    active: Boolean
    parent: Brand
    store: Store
    createdAt: String!
    updatedAt: String!
  }

  type OneBrand {
    id: ID!
    brandId: String
    name: String
    slug: String
    position: Int
    info: String
    meta: String
    metaTitle: String
    metaDescription: String
    metaKeywords: String
    img: String
    featured: Boolean
    user: ID
    sizechart: String
    facebookUrl: String
    twitterUrl: String
    linkedinUrl: String
    youtubeUrl: String
    instaUrl: String
    pinterestUrl: String
    googleUrl: String
    active: Boolean
    parent: ID
    store: ID
    createdAt: String
    updatedAt: String
  }

  type brandRes {
    data: [Brand]
    count: Int
    pageSize: Int
    page: Int
  }
`
