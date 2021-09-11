import { gql } from 'apollo-server-express'

export default gql`
  extend type Query {
    banners(
      page: Int
      search: String
      limit: Int
      sort: String
      type: String
      pageId: String
      groupId: String
      groupTitle: String
      isLinkExternal: Boolean
      active: Boolean
      store: ID
    ): bannerRes
    allBanners(
      page: Int
      search: String
      limit: Int
      sort: String
      type: String
      pageId: String
      store: ID
      active: Boolean
      isLinkExternal: Boolean
    ): bannerRes @admin
    banner(id: String!): OneBanner
    bannerGroup(
      groupId: String!
      page: Int
      search: String
      limit: Int
      sort: String
      type: String
      pageId: String
      isLinkExternal: Boolean
      active: Boolean
      store: ID
    ): bannerRes @admin
    groupByBanner(
      type: String
      pageId: String
      groupTitle: String
      active: Boolean
      store: ID
    ): [bannerGroup]
    groupByBanner1(
      type: String
      pageId: String
      groupTitle: String
      store: ID
    ): [bannerGroup1]
  }

  extend type Mutation {
    saveBanner(
      id: String!
      link: String
      heading: String
      img: String
      type: String
      groupId: String
      groupTitle: String
      pageId: String
      isLinkExternal: Boolean
      sort: Int
      active: Boolean
      store: ID
    ): OneBanner @auth
    deleteBanner(id: ID!): Boolean @admin
  }

  type Banner {
    id: ID!
    link: String
    heading: String
    img: String
    type: String
    groupId: String
    groupTitle: String
    pageType: String
    pageId: String
    sort: Int
    active: Boolean
    isLinkExternal: Boolean
    store: Store
    createdAt: String!
    updatedAt: String!
  }

  type OneBanner {
    id: ID!
    link: String
    heading: String
    img: String
    type: String
    groupId: String
    groupTitle: String
    pageType: String
    pageId: String
    sort: Int
    active: Boolean
    isLinkExternal: Boolean
    store: ID
    createdAt: String!
    updatedAt: String!
  }

  type bannerGroup {
    _id: bgData
    data: [OneBanner]
  }
  type bgData {
    title: String
  }
  type bannerGroup1 {
    _id: String
    data: [OneBanner]
  }
  type bannerRes {
    data: [OneBanner]
    count: Int
    pageSize: Int
    page: Int
  }
`
