import mongoose, { Schema } from 'mongoose'
import { DOMAIN_NAME } from '../config'
import { SettingsDocument } from '../types'

const { ObjectId } = Schema.Types

const settingSchema = new Schema(
  {
    // Admin order notifications
    adminNotifications: {
      lowStockNotification: { type: Boolean, default: true },
      newOrderPlaced: { type: Boolean, default: true },
    },
    // adminPanelLink: { type: String }, //comment beacause taking from .env
    alert: { type: String },
    CASHFREE_KEY_ID: { type: String },
    CDN_URL: { type: String },
    closed: { type: Boolean, default: false },
    closedMessage: { type: String },
    country: { type: String, default: 'india' },
    currencyCode: { type: String, default: 'INR' },
    currencyDecimals: { type: Number, default: 2 },
    currencySymbol: { type: String, default: '₹' },
    // Customer order notifications
    customerOrderNotifications: {
      downloadEGoods: { type: Boolean, default: true },
      giftCardPurchased: { type: Boolean, default: true },
      orderConfirmation: { type: Boolean, default: true },
      orderIsReadyForPickup: { type: Boolean, default: true },
      orderShipped: { type: Boolean, default: true },
      orderStatusChanged: { type: Boolean, default: true },
    },
    demo: { type: Boolean, default: false },
    description: { type: String },
    detailMeta: { type: String },
    email: {
      bcc: { type: Array, default: [`Customer Service <care@${DOMAIN_NAME}>`] },
      cc: { type: Array, default: [`Swadesh Behera <swadesh@${DOMAIN_NAME}>`] },
      enabled: { type: Boolean, default: false },
      from: {
        type: String,
        default: `${DOMAIN_NAME} <no-reply@${DOMAIN_NAME}>`,
      },
      printers: {
        type: Array,
        default: [`${DOMAIN_NAME} <print@hpeprint.com>`],
      },
      SENDGRID_API_KEY: { type: String },
    },
    enableRazorpay: { type: Boolean, default: false },
    enableStripe: { type: Boolean, default: false },
    enableTax: { type: Boolean, default: false },
    enableZips: { type: Boolean, default: false },
    facebook: { type: String },
    favicon: { type: String },
    google: { type: String },
    googleMapsApi: { type: String },
    homeMeta1: { type: String },
    homeMeta2: { type: String },
    homeMeta3: { type: String },
    homeMeta4: { type: String },
    instagram: { type: String },
    linkedin: { type: String },
    isMultiStore: { type: Boolean, default: false },
    isMultiVendor: { type: Boolean, default: false },
    isMegamenu: { type: Boolean, default: true },
    isSearch: { type: Boolean, default: true },
    joiningBonus: { type: Number, default: 0 },
    keywords: { type: String },
    language: { type: String },
    listingMeta: { type: String },
    liveCommerce: { type: Boolean, default: false },
    login: {
      FACEBOOK_ID: { type: String },
      FACEBOOK_SECRET: { type: String },
      GITHUB_ID: { type: String },
      GITHUB_SECRET: { type: String },
      GOOGLE_ID: { type: String },
      GOOGLE_SECRET: { type: String },
      LINKEDIN_ID: { type: String },
      LINKEDIN_SECRET: { type: String },
      TWITTER_ID: { type: String },
      TWITTER_SECRET: { type: String },
    },
    locationExpiry: { type: Number, default: 157680000000 },
    logo: { type: String },
    logoDark: { type: String },
    logoMobile: { type: String },
    logoMobileDark: { type: String },
    minimumOrderValue: { type: Number, default: 0 },
    multilingual: { type: Boolean, default: false },
    openGraphImage: { type: String },
    otpLogin: { type: Boolean, default: true },
    pageSize: { type: Number },
    payment: {
      INSTAMOJO_API_KEY: { type: String },
      INSTAMOJO_AUTH_TOKEN: { type: String },
      INSTAMOJO_SANDBOX_MODE: { type: Boolean, default: true },
      PAYPAL_CLIENT_ID: { type: String },
      PAYPAL_CLIENT_SECRET: { type: String },
      PAYPAL_MODE: { type: String, default: 'sandbox' },
      STRIPE_APIKEY: { type: String },
    },
    paymentMethods: {
      type: Array,
      default: ['Stripe', 'Razorpay', 'COD'],
    },
    paymentStage: {
      type: String,
      default: 'PROD',
    },
    product: { moderate: false },
    q: { type: String },
    RAZORPAY_KEY_ID: { type: String },
    referralBonus: { type: Number, default: 0 },
    returnReasons: {
      type: Array,
      default: [
        { val: 'DEFECTIVE_PRODUCT', name: 'Item or part defective' },
        {
          val: 'DAMAGED_PRODUCT',
          name: 'Item or part was broken/damaged on arrival',
        },
        { val: 'SIZE_FIT_ISSUES', name: 'Size fit issue' },
        { val: 'QUALITY_ISSUES', name: 'Quality issue' },
        { val: 'MISSHIPMENT', name: 'Received a different item' },
        { val: 'COLOR_STYLE_ISSUES', name: 'Color style issue' },
        { val: 'MISSING_ITEM', name: 'Item missing' },
        { val: 'DEAD_ON_ARRIVAL', name: 'Item was dead on arrival' },
      ],
    },
    review: {
      enabled: { type: Boolean, default: true },
      moderate: { type: Boolean, default: false },
    },
    searchbarText: {
      type: String,
      default: 'Search for products, brands and more',
    },
    shipping: {
      charge: Number,
      free: Number,
      method: { type: String },
      deliveryDays: Number,
      enabled: { type: Boolean, default: false },
      provider: { type: String, default: 'shippo' }, //shippo or shiprocket or wareiq
    },
    shopAddress: { type: String },
    shopPhone: { type: String },
    stripePublishableKey: { type: String },
    sms: {
      enabled: { type: Boolean, default: false },
      provider: { type: String, default: 'twilio' },
      TWILIO_API_KEY: { type: String },
      AUTO_VERIFICATION_ID: { type: String, default: 'BoBI72gsKkc' },
    },
    storage: {
      enabled: { type: Boolean, default: true },
      provider: { type: String, default: 'local' },
    },
    storageProvider: {
      type: String,
      default: 'local',
    },
    tax: {
      cgst: { type: Number, default: 0 },
      sgst: { type: Number, default: 0 },
      igst: { type: Number, default: 0 },
    },
    title: { type: String },
    twitter: { type: String },
    userRoles: {
      type: Array,
      default: ['user', 'vendor', 'manager', 'admin', 'super'],
    }, // This should be in ascending order of authority. e.g. In this case guest will not have access to any other role, where as admin will have the role of guest+user+vendor+manager+admin
    websiteEmail: { type: String },
    websiteLegalName: { type: String },
    websiteName: { type: String }, // Required. Its like the SAAS provider name
    zips: { type: Array },

    // orderStatuses: {
    //   type: Array,
    //   default: [
    //     'Received',
    //     'Order Placed',
    //     'Order Accepted',
    //     'Order Executed',
    //     'Shipped',
    //     'Delivered',
    //     'Not in Stock',
    //     'Cancellation Requested',
    //     'Cancelled',
    //   ],
    // },
    // paymentStatuses: { type: Array, default: ['Pending', 'Cancelled', 'Paid'] },
  },
  {
    versionKey: false,
    timestamps: true,
  }
)

settingSchema.index({
  '$**': 'text',
})

export const Setting = mongoose.model<SettingsDocument>(
  'Setting',
  settingSchema
)
