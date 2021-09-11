import { gql } from 'apollo-server-express'

export default gql`
  extend type Query {
    me: UserOne @auth
    users(
      page: Int
      search: String
      limit: Int
      sort: String
      role: String
      store: ID
    ): userRes @support
    allUsers(
      page: Int
      search: String
      limit: Int
      sort: String
      role: String
      store: ID
    ): userRes @super
    user(id: String!): User @auth
    userSummary: TodaysSummary @admin
    fcmToken: Boolean
    topVendors(limit: Int): [User]
  }

  extend type Mutation {
    removeUser(id: ID!): Boolean @admin
    getOtp(phone: String!, role: String): Otp
    verifyOtp(phone: String!, otp: String!): User
    sendInvitation(emails: String): Boolean
    resendEmail(email: String): String
    verifyEmail(
      id: ID!
      token: String!
      expires: String!
      signature: String!
    ): Boolean
    emailPassword(email: String!, referrer: String!): String
    resetPassword(
      id: ID!
      token: String
      password: String
      passwordConfirmation: String
    ): Boolean
    changePassword(
      oldPassword: String!
      password: String!
      passwordConfirmation: String!
    ): Boolean
    saveUser(
      id: String!
      firstName: String
      lastName: String
      email: String
      avatar: String
      banner: String
      gender: String
      city: String
      state: String
      phone: String
      zip: Int
      role: String
      roles: [ID]
      verified: Boolean
      active: Boolean
      shippingCharges: Int
      freeShippingOn: Int
      storeName: String
      banner: String
      store: ID
    ): User @admin
    register(
      firstName: String
      lastName: String
      email: String!
      phone: String
      password: String!
      passwordConfirmation: String!
      referrer: String
      referralCode: String
    ): User @guest

    updateProfile(
      firstName: String
      lastName: String
      email: String
      role: String
      gender: String
      info: InputInfo
      phone: String
      dob: String
      avatar: String
      provider: String
      active: Boolean
      verified: Boolean
      address: AddressInput
      meta: String
      metaTitle: String
      metaDescription: String
      metaKeywords: String
      shippingCharges: Int
      freeShippingOn: Int
      storeName: String
      banner: String
      store: ID
    ): User @auth

    login(email: String!, password: String!): User @guest
    signOut: Boolean @auth
    googleOneTap(credential: String!): User
    referrelUser(referralCode: String, phone: String): User
    saveBusinessDetail(
      accountNo: Float
      bankName: String
      ifsc: String
      accountHolderName: String
    ): User
    attachUserToStore(storeId: ID!, userId: ID!): User @admin
    removeUserFromStore(userId: ID!): User @admin
  }

  input AddressInput {
    id: ID
    email: String
    firstName: String
    lastName: String
    address: String
    town: String
    city: String
    country: String
    district: String
    state: String
    # coords: Geo
    lat: Float
    lng: Float
    zip: Int
    phone: String
    active: Boolean
  }

  input InputInfo {
    public: Boolean
    store: String
    storePhotos: [String]
  }

  type Info {
    public: Boolean
    store: String
    storePhotos: [String]
  }

  type Otp {
    otp: String
    timer: Int
  }

  type userRes {
    data: [User]
    count: Int
    pageSize: Int
    page: Int
  }

  type User {
    id: ID
    _id: ID
    firstName: String
    lastName: String
    name: String
    phone: String
    email: String
    role: String
    slug: String
    gender: String
    info: Info
    avatar: String
    provider: String
    active: Boolean
    verified: Boolean
    address: [Address]
    ratings: Float
    reviews: Float
    roles: [ID]
    city: String
    store: ID
    productSold: Int
    meta: String
    metaTitle: String
    metaDescription: String
    metaKeywords: String
    createdAt: String
    updatedAt: String
    plan: String
    shippingCharges: Int
    freeShippingOn: Int
    sid: String
    luluCustomerNo: String
    referralCode: String
    currentBalance: Float
    businessDetail: BusinessDetail
    storeName: String
    banner: String
  }
  type UserOne {
    id: ID
    _id: ID
    firstName: String
    lastName: String
    phone: String
    email: String
    role: String
    slug: String
    gender: String
    info: Info
    avatar: String
    provider: String
    active: Boolean
    verified: Boolean
    address: [Address]
    ratings: Float
    reviews: Float
    roles: [Role]
    city: String
    store: ID
    productSold: Int
    meta: String
    metaTitle: String
    metaDescription: String
    metaKeywords: String
    createdAt: String!
    updatedAt: String!
    plan: String
    shippingCharges: Int
    freeShippingOn: Int
    sid: String
    luluCustomerNo: String
    referralCode: String
    currentBalance: Float
    businessDetail: BusinessDetail
    storeName: String
    banner: String
  }

  type BusinessDetail {
    accountNo: Float
    bankName: String
    ifsc: String
    accountHolderName: String
  }
`
