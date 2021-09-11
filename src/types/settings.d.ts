import { Document } from 'mongoose'

export interface SettingsDocument extends Document {
  adminNotifications: {
    lowStockNotification: boolean
    newOrderPlaced: boolean
  }
  // adminPanelLink: string
  alert: string
  CASHFREE_KEY_ID: string
  CDN_URL: string
  closed: boolean
  closedMessage: string
  country: string
  currencyCode: string
  currencyDecimals: number
  currencySymbol: string
  customerOrderNotifications: {
    downloadEGoods: boolean
    giftCardPurchased: boolean
    orderConfirmation: boolean
    orderIsReadyForPickup: boolean
    orderShipped: boolean
    orderStatusChanged: boolean
  }
  demo: boolean
  description: string
  detailMeta: string
  email: {
    bcc: string
    cc: string
    enabled: boolean
    from: string
    printers: string
    SENDGRID_API_KEY: string
  }
  enableRazorpay: boolean
  enableStripe: boolean
  enableTax: boolean
  enableZips: boolean
  facebook: string
  favicon: string
  google: string
  googleMapsApi: string
  homeMeta1: string
  homeMeta2: string
  homeMeta3: string
  homeMeta4: string
  instagram: string
  isMultiStore: boolean
  isMultiVendor: boolean
  isMegamenu: boolean
  isSearch: boolean
  joiningBonus: number
  keywords: string
  language: string
  listingMeta: string
  liveCommerce: boolean
  login: {
    FACEBOOK_ID: string
    FACEBOOK_SECRET: string
    GITHUB_ID: string
    GITHUB_SECRET: string
    GOOGLE_ID: string
    GOOGLE_SECRET: string
    LINKEDIN_ID: string
    LINKEDIN_SECRET: string
    TWITTER_ID: string
    TWITTER_SECRET: string
  }
  locationExpiry: number
  logo: string
  logoDark: string
  logoMobile: string
  logoMobileDark: string
  minimumOrderValue: number
  multilingual: boolean
  openGraphImage: string
  otpLogin: boolean
  pageSize: number
  payment: {
    INSTAMOJO_API_KEY: string
    INSTAMOJO_AUTH_TOKEN: string
    INSTAMOJO_SANDBOX_MODE: boolean
    PAYPAL_CLIENT_ID: string
    PAYPAL_CLIENT_SECRET: string
    PAYPAL_MODE: string
    STRIPE_APIKEY: string
  }
  paymentMethods: [string]
  paymentStage: String
  product: { moderate: boolean }
  q: string
  RAZORPAY_KEY_ID: string
  referralBonus: number
  returnReasons: [string]
  review: {
    enabled: boolean
    moderate: boolean
  }
  searchbarText: string
  shipping: {
    charge: number
    deliveryDays: number
    free: number
    method: string
    enabled: boolean
    provider: string
  }
  shopAddress: string
  shopPhone: string
  stripePublishableKey: string
  sms: {
    AUTO_VERIFICATION_ID: string
    enabled: boolean
    provider: string
    TWILIO_API_KEY: string
  }
  storage: {
    enabled: boolean
    provider: string
  }
  storageProvider: string
  tax: { cgst: number; sgst: number; igst: number }
  title: string
  twitter: string
  userRoles: [string]
  websiteEmail: string
  websiteLegalName: string
  websiteName: string
  zips: [string]

  // orderStatuses: {
  //   type: [string]
  //   default: [
  //     'Received',
  //     'Order Placed',
  //     'Order Accepted',
  //     'Order Executed',
  //     'Shipped',
  //     'Delivered',
  //     'Not in Stock',
  //     'Cancellation Requested',
  //     'Cancelled'
  //   ]
  // }
  // paymentStatuses: { type: [string]; default: ['Pending', 'Cancelled', 'Paid'] }
}
