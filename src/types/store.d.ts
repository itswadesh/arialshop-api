import { Document } from 'mongoose'
import { UserDocument, ProductDocument } from '.'

export interface StoreDocument extends Document {
  active: boolean
  adminNotifications: {
    lowStockNotification: boolean
    newOrderPlaced: boolean
  }
  address: string
  alert: string
  analyticsTrackingId: string
  banners: [string]
  city: string
  closed: boolean
  closedMessage: string
  country: string
  currency: string
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
  description: string
  detailMeta: string
  dimentionUnit: string
  domain: string
  email: string
  facebook: string
  facebookPixelId: string
  facebookUrl: string
  favicon: string
  firstName: string
  freeShippingOn: number
  gdprCookieConsent: string
  google: string
  googleAdsTag: string
  homeMeta1: string
  homeMeta2: string
  homeMeta3: string
  homeMeta4: string
  bankAccountNo: string
  bankAccountHolderName: string
  bankIfscCode: string
  img: string
  images: [string]
  instagram: string
  instagramUrl: string
  isHideNilStock: boolean
  isMegamenu: boolean
  isOpen: boolean
  isSearch: boolean
  keywords: string
  lastName: string
  lat: number
  legalName: string
  linkedin: string
  lng: number
  locality: string
  logo: string
  logoDark: string
  logoMobile: string
  logoMobileDark: string
  minimumOrderValue: number
  minOrderValue: number
  name: string
  openGraphImage: string
  pageSize: number
  phone: string
  pinterestTag: string
  pinterestUrl: string
  qrCode: string
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
  shippingCharge: number
  shopAddress: string
  shopPhone: string
  slug: string
  snapChatPixel: string
  state: string
  storeId: string // in case manually alloted id
  timeZone: string
  timing: string
  title: string
  twitter: string
  twitterUrl: string
  user: UserDocument['_id']
  websiteEmail: string
  websiteLegalName: string
  websiteName: string
  weightUnit: string
  youtubeUrl: string
  zip: number
}
