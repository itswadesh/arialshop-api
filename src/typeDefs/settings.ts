import { gql } from 'apollo-server-express'

export default gql`
  extend type Query {
    shutter: Boolean
    worldCurrencies: [String!]
    orderStatuses: [OrderStatus!]
    paymentStatuses: [String!]
    returnReasons: [String!]
    sorts: [NameVal!]
    timesList: [String!]
    userRoles: [String!]
    settings: Setting
    settingsAdmin: Setting
  }
  extend type Mutation {
    saveSettings(
      id: ID!
      websiteName: String
      title: String
      liveCommerce: Boolean
      multilingual: Boolean
      alert: String
      keywords: String
      description: String
      minimumOrderValue: Int
      shipping: ShippingIp
      tax: TaxIp
      websiteEmail: String
      shopPhone: String
      shopAddress: String
      websiteLegalName: String
      currencyCode: String
      currencySymbol: String
      currencyDecimals: Int
      openGraphImage: String
      country: String
      language: String
      logo: String
      logoDark: String
      logoMobile: String
      logoMobileDark: String
      favicon: String
      CDN_URL: String
      searchbarText: String
      demo: Boolean
      otpLogin: Boolean
      pageSize: Int
      # product: { moderate: false },
      enableZips: Boolean
      closed: Boolean
      closedMessage: String
      zips: [String]
      orderStatuses: [String]
      paymentStatuses: [String]
      sms: SmsIp
      email: EmailIp
      storage: StorageIp
      review: ReviewSettingIp
      product: ProductSettingIp
      login: LoginSettingIp
      googleMapsApi: String
      RAZORPAY_KEY_ID: String
      CASHFREE_KEY_ID: String
      stripePublishableKey: String
      enableStripe: Boolean
      enableRazorpay: Boolean
      facebook: String
      twitter: String
      google: String
      instagram: String
      linkedin: String
      enableTax: Boolean
      locationExpiry: Float
      referralBonus: Float
      joiningBonus: Float
      customerOrderNotifications: UserNotificationIp
      adminNotifications: AdminNotificationIp
      isMultiStore: Boolean
      isMultiVendor: Boolean
      isMegamenu: Boolean
      isSearch: Boolean
      storageProvider: String
    ): Setting @admin
  }

  extend type Subscription {
    settingsUpdated: Setting
  }

  type OrderStatus {
    status: String
    title: String
    body: String
    icon: String
    public: Boolean
    index: Int
  }

  input ProductSettingIp {
    moderate: Boolean
  }

  input LoginSettingIp {
    FACEBOOK_ID: String
    FACEBOOK_SECRET: String
    TWITTER_ID: String
    TWITTER_SECRET: String
    GOOGLE_ID: String
    GOOGLE_SECRET: String
    GITHUB_ID: String
    GITHUB_SECRET: String
  }

  type LoginSetting {
    FACEBOOK_ID: String
    FACEBOOK_SECRET: String
    TWITTER_ID: String
    TWITTER_SECRET: String
    GOOGLE_ID: String
    GOOGLE_SECRET: String
    GITHUB_ID: String
    GITHUB_SECRET: String
  }

  type ProductSetting {
    moderate: Boolean
  }

  input ReviewSettingIp {
    enabled: Boolean
    moderate: Boolean
  }

  type ReviewSetting {
    enabled: Boolean
    moderate: Boolean
  }

  input ShippingIp {
    deliveryDays: Int
    charge: Int
    free: Int
    method: String
    enabled: Boolean
    provider: String
  }

  type Shipping {
    deliveryDays: Int
    charge: Int
    free: Int
    method: String
    enabled: Boolean
    provider: String
  }

  type Shutter {
    open: Boolean
    message: String
  }

  input TaxIp {
    cgst: Float
    sgst: Float
    igst: Float
  }

  type Tax {
    cgst: Float
    sgst: Float
    igst: Float
  }

  type Email {
    enabled: Boolean
    from: String
    to: [String]
    cc: [String]
    bcc: [String]
    printers: [String]
  }

  input EmailIp {
    enabled: Boolean
    from: String
    to: [String]
    cc: [String]
    bcc: [String]
    printers: [String]
  }

  type NameVal {
    name: String
    val: String
  }

  type NameValue {
    name: String
    value: String
  }

  input NameValIp {
    name: String
    val: String
  }

  type Sms {
    AUTO_VERIFICATION_ID: String
    enabled: Boolean
    provider: String
  }

  input SmsIp {
    provider: String
    FAST2SMS_API_KEY: String
    TWILIO_API_KEY: String
    Fast2SMS_OTP_TEMPLATE_ID: Int
    AUTO_VERIFICATION_ID: String
    enabled: Boolean
  }

  input UserNotificationIp {
    orderConfirmation: Boolean
    orderStatusChanged: Boolean
    orderShipped: Boolean
    orderIsReadyForPickup: Boolean
    downloadEGoods: Boolean
    giftCardPurchased: Boolean
  }

  input AdminNotificationIp {
    newOrderPlaced: Boolean
    lowStockNotification: Boolean
  }

  type UserNotification {
    orderConfirmation: Boolean
    orderStatusChanged: Boolean
    orderShipped: Boolean
    orderIsReadyForPickup: Boolean
    downloadEGoods: Boolean
    giftCardPurchased: Boolean
  }

  type AdminNotification {
    newOrderPlaced: Boolean
    lowStockNotification: Boolean
  }

  input StorageIp {
    provider: String
    enabled: Boolean
  }

  type Storage {
    provider: String
    enabled: Boolean
  }

  type Setting {
    id: String
    websiteName: String
    shutter: Shutter
    title: String
    liveCommerce: Boolean
    multilingual: Boolean
    alert: String
    keywords: String
    description: String
    minimumOrderValue: Int
    shipping: Shipping
    currencyCode: String
    openGraphImage: String
    currencySymbol: String
    currencyDecimals: Int
    userRoles: [String]
    sorts: [NameVal]
    RAZORPAY_KEY_ID: String
    CASHFREE_KEY_ID: String
    GOOGLE_CLIENT_ID: String
    tax: Tax
    websiteEmail: String
    shopPhone: String
    shopAddress: String
    websiteLegalName: String
    country: String
    language: String
    logo: String
    logoDark: String
    logoMobile: String
    logoMobileDark: String
    favicon: String
    CDN_URL: String
    S3_URL: String
    searchbarText: String
    ADMIN_PANEL_LINK: String
    demo: Boolean
    otpLogin: Boolean
    pageSize: Int
    # product: { moderate: false },
    enableZips: Boolean
    closed: Boolean
    closedMessage: String
    zips: [String]
    returnReasons: [String]
    orderStatuses: [OrderStatus]
    paymentStatuses: [String]
    paymentMethods: [PaymentMethod]
    sms: Sms
    email: Email
    storage: Storage
    storageProvider: String
    review: ReviewSetting
    product: ProductSetting
    login: LoginSetting
    googleMapsApi: String
    stripePublishableKey: String
    enableStripe: Boolean
    enableRazorpay: Boolean
    facebook: String
    twitter: String
    google: String
    instagram: String
    linkedin: String
    enableTax: Boolean
    locationExpiry: Float
    WWW_URL: String
    customerOrderNotifications: UserNotification
    adminNotifications: AdminNotification
    referralBonus: Float
    joiningBonus: Float
    isMultiStore: Boolean
    isMultiVendor: Boolean
    isMegamenu: Boolean
    isSearch: Boolean
  }
`
