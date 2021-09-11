import { gql } from 'apollo-server-express'

export default gql`
  extend type Query {
    subscriptions(
      page: Int
      search: String
      limit: Int
      sort: String
      active: Boolean
    ): subscriptionRes
    subscription(id: ID!): SaasSubscription
  }
  extend type Mutation {
    deleteSubscription(id: ID!): Boolean @auth
    saveSubscription(
      id: String!
      abandonnedCartRecovery: Boolean
      active: Boolean
      annualMonthlyPrice: Float
      chatSupport: Boolean
      customDomain: Boolean
      description: String
      discountCoupons: Boolean
      emailSupport: Boolean
      freeSSL: Boolean
      misReports: Boolean
      monthlyPrice: Float
      name: String
      onlineStore: Boolean
      premiumSupport: Boolean
      productImportExport: Boolean
      productsAllowed: Int
      removeMisikiLogo: Boolean
      salesChannels: Boolean
      seoOptions: Boolean
      title: String
      transactionFees: Float
      transactionFeesType: String
      unlimitedProducts: Boolean
      unlimitedValidity: Boolean
    ): OneSubscription @auth
  }

  type SaasSubscription {
    id: ID
    abandonnedCartRecovery: Boolean
    active: Boolean
    annualMonthlyPrice: Float
    chatSupport: Boolean
    customDomain: Boolean
    description: String
    discountCoupons: Boolean
    emailSupport: Boolean
    freeSSL: Boolean
    misReports: Boolean
    monthlyPrice: Float
    name: String
    onlineStore: Boolean
    premiumSupport: Boolean
    productImportExport: Boolean
    productsAllowed: Int
    removeMisikiLogo: Boolean
    salesChannels: Boolean
    seoOptions: Boolean
    title: String
    transactionFees: Float
    transactionFeesType: String
    unlimitedProducts: Boolean
    unlimitedValidity: Boolean
    createdAt: String
    updatedAt: String
  }

  type OneSubscription {
    id: ID
    abandonnedCartRecovery: Boolean
    active: Boolean
    annualMonthlyPrice: Float
    chatSupport: Boolean
    customDomain: Boolean
    description: String
    discountCoupons: Boolean
    emailSupport: Boolean
    freeSSL: Boolean
    misReports: Boolean
    monthlyPrice: Float
    name: String
    onlineStore: Boolean
    premiumSupport: Boolean
    productImportExport: Boolean
    productsAllowed: Int
    removeMisikiLogo: Boolean
    salesChannels: Boolean
    seoOptions: Boolean
    title: String
    transactionFees: Float
    transactionFeesType: String
    unlimitedProducts: Boolean
    unlimitedValidity: Boolean
    createdAt: String
    updatedAt: String
  }

  type subscriptionRes {
    data: [SaasSubscription]
    count: Int
    pageSize: Int
    page: Int
  }
`
