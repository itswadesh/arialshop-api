import mongoose, { Schema } from 'mongoose'
import { generateSlug } from '../utils'
import { StoreDocument } from '../types'
import { WWW_URL } from '../config'
const { ObjectId } = Schema.Types
import { ELASTIC_NODE } from '../config'

const storeSchema = new Schema(
  {
    active: { type: Boolean, default: true, es_indexed: true },
    approved: { type: Boolean, default: false, es_indexed: true },
    featured: { type: Boolean, default: true, es_indexed: true },
    adminNotifications: {
      lowStockNotification: { type: Boolean, default: true },
      newOrderPlaced: { type: Boolean, default: true },
    },
    address: { type: String, es_indexed: true },
    alert: { type: String },
    analyticsTrackingId: { type: String },
    banners: [{ type: String }],
    city: { type: String, es_indexed: true },
    closed: { type: Boolean, default: false },
    closedMessage: { type: String },
    country: { type: String, default: 'india' },
    currency: { type: String },
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
    description: { type: String },
    detailMeta: { type: String },
    dimentionUnit: { type: String },
    domain: { type: String },
    email: { type: String },
    bankAccountNo: { type: String },
    bankAccountHolderName: { type: String },
    bankIfscCode: { type: String },
    facebook: { type: String },
    facebookPixelId: { type: String },
    facebookUrl: { type: String },
    favicon: { type: String },
    firstName: { type: String },
    freeShippingOn: { type: Number, default: 0 },
    gdprCookieConsent: { type: String },
    google: { type: String },
    googleAdsTag: { type: String },
    homeMeta1: { type: String },
    homeMeta2: { type: String },
    homeMeta3: { type: String },
    homeMeta4: { type: String },
    img: { type: String },
    images: [{ type: String }],
    instagram: { type: String },
    instagramUrl: { type: String },
    isHideNilStock: { type: Boolean, default: false },
    isMegamenu: { type: Boolean, default: true },
    isOpen: { type: Boolean, default: false },
    isSearch: { type: Boolean, default: true },
    keywords: { type: String },
    lastName: { type: String },
    lat: { type: Number },
    legalName: { type: String },
    linkedin: { type: String },
    lng: { type: Number },
    locality: { type: String },
    logo: { type: String },
    logoDark: { type: String },
    logoMobile: { type: String },
    logoMobileDark: { type: String },
    minimumOrderValue: { type: Number, default: 0 },
    minOrderValue: { type: Number, default: 0 },
    name: { type: String, required: true, es_indexed: true },
    openGraphImage: { type: String },
    pageSize: { type: Number, default: 40 },
    phone: { type: String },
    pinterestTag: { type: String },
    pinterestUrl: { type: String },
    qrCode: { type: String },
    review: {
      enabled: { type: Boolean, default: true },
      moderate: { type: Boolean, default: false },
    },
    searchbarText: {
      default: 'Search for stores, brands and more',
      type: String,
    },
    shipping: {
      charge: Number,
      deliveryDays: Number,
      enabled: { type: Boolean, default: false },
      free: Number,
      method: { type: String },
      provider: { type: String, default: 'shippo' }, //shippo or shiprocket or wareiq
    },
    shippingCharge: { type: Number, default: 0 },
    shopAddress: { type: String },
    shopPhone: { type: String },
    slug: { type: String, es_indexed: true },
    snapChatPixel: { type: String },
    state: { type: String },
    storeId: { type: String, es_indexed: true }, // in case manually alloted id
    timeZone: { type: String },
    timing: { type: String },
    title: { type: String },
    twitter: { type: String },
    twitterUrl: { type: String },
    user: { type: ObjectId, ref: 'User' },
    websiteEmail: { type: String },
    websiteLegalName: { type: String },
    websiteName: { type: String },
    weightUnit: { type: String },
    youtubeUrl: { type: String },
    zip: { type: Number },
    createdAt: { type: Date, es_type: 'date', es_indexed: true },
    updatedAt: { type: Date, es_type: 'date', es_indexed: true },
  },
  {
    versionKey: false,
    timestamps: true,
  }
)
// storeSchema.virtual('subdomain').get(function () {
//   const subdomain = `${this.slug}.${WWW_URL || 'localhost'}`
//   console.log('xxxxxxxxxxxx', subdomain)
//   return subdomain
// })
// storeSchema.pre('save', async function (this: StoreDocument) {
//   this.slug = await generateSlug(this.name, this.slug, 'string')
//   this.q += this.info ? this.info + ' ' : ''
//   this.q += this.active ? this.active + ' ' : ''
//   this.q += ' '
// })
storeSchema.pre<StoreDocument>('save', async function () {
  if (!this.slug)
    this.slug = await generateSlug(
      this.name,
      'store',
      this.slug,
      'number',
      null
    )
  if (!this.domain) {
    const domain = new URL(WWW_URL)
    const subdomain = `${this.slug}.${domain.hostname}`
    console.log('subdomain generated...', subdomain)
    this.domain = subdomain
  }
})

storeSchema.index({
  '$**': 'text',
})

const mongoosastic = require('mongoosastic')

try {
  storeSchema.plugin(mongoosastic, {
    hosts: [ELASTIC_NODE],
    // populate: [],
  })
} catch (e) {
  console.log('mongoosastic err:: ', e)
}

export const Store = mongoose.model<StoreDocument>('Store', storeSchema)

const Promise = require('bluebird')
// @ts-ignore
Store.esSearch = Promise.promisify(Store.esSearch, { context: Store })
