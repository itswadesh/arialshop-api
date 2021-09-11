import { gql } from 'apollo-server-express'

export default gql`
  extend type Query {
    megamenu(
      id: ID
      slug: String
      search: String
      sort: String
      featured: Boolean
      brand: ID
      store: ID
    ): [Category]
    categories(
      page: Int
      search: String
      limit: Int
      sort: String
      level: Int
      featured: Boolean
      megamenu: Boolean
      active: Boolean
      img: Boolean
      shopbycategory: Boolean
      store: ID
    ): categoryResSimple
    allCategories(
      page: Int
      search: String
      limit: Int
      sort: String
      level: Int
      featured: Boolean
      megamenu: Boolean
      active: Boolean
      shopbycategory: Boolean
      store: ID
    ): categoryRes
    megamenuAll(
      id: ID
      search: String
      sort: String
      featured: Boolean
    ): [CategorySimple] @vendor
    category(id: String, slug: String): Category
    categorySimple(id: String, slug: String): CategorySimple
    categorySummary: TodaysSummary @auth
    attributeCategories: [Category] @admin
  }

  extend type Mutation {
    refreshCategorySlug: Boolean
    saveCategory(
      id: String!
      name: String
      description: String
      categoryId: String
      parent: ID
      brand: ID
      slug: String
      refreshSlug: Boolean
      img: String
      level: Int
      meta: String
      metaTitle: String
      metaDescription: String
      metaKeywords: String
      position: Int
      megamenu: Boolean
      featured: Boolean
      active: Boolean
      shopbycategory: Boolean
      store: ID
    ): CategorySimple @admin
    deleteCategory(id: ID!): Boolean @admin
    deleteAllCategories(password: String!): Int @admin
    changeParentOfCategory(catId: ID!, parentCatId: ID!): Boolean @admin

    importCategory(file: Upload!): Boolean
  }

  type Category {
    _id: ID
    id: ID!
    index: Int
    name: String
    description: String
    parent: Category
    slug: String
    categoryId: String
    path: String
    slugPath: String
    namePath: String
    pathA: [Category]
    level: Int
    position: Int
    megamenu: Boolean
    meta: String
    metaTitle: String
    metaDescription: String
    metaKeywords: String
    img: String
    featured: Boolean
    shopbycategory: Boolean
    children: [Category]
    user: User
    count: Int
    sizechart: String
    active: Boolean
    createdAt: String
    updatedAt: String
    attributes: [Attribute]
    brand: Brand
    store: Store
  }
  type CategorySimple {
    _id: ID
    id: ID!
    index: Int
    name: String
    description: String
    parent: ID
    slug: String
    categoryId: ID
    path: String
    slugPath: String
    namePath: String
    pathA: [ID]
    level: Int
    position: Int
    megamenu: Boolean
    meta: String
    metaTitle: String
    metaDescription: String
    metaKeywords: String
    img: String
    featured: Boolean
    shopbycategory: Boolean
    children: [CategorySimple]
    user: User
    count: Int
    sizechart: String
    active: Boolean
    location: String
    brand: ID
    store: ID
    createdAt: String
    updatedAt: String
  }

  type categoryRes {
    data: [Category]
    count: Int
    pageSize: Int
    page: Int
  }
  type categoryResSimple {
    data: [CategorySimple]
    count: Int
    pageSize: Int
    page: Int
  }
`
