import { Document, Model } from 'mongoose'
import {
  AddressDocument,
  ProductDocument,
  RoleDocument,
  StoreDocument,
} from './'

export interface UserDocument extends Document {
  active: boolean
  address: AddressDocument['_id']
  avatar: string
  banner: string
  businessDetail: BusinessDetailDocument
  city: string
  currentBalance: number
  email: string
  referrer: string
  facebook: any
  firstName: string
  freeShippingOn: number
  gender: string
  github: any
  google: any
  info: InfoDocument
  lastName: string
  lastSignIn: Date
  luluCustomerNo: string
  matchesPassword: (password: string) => Promise<boolean>
  meta: string
  metaDescription: string
  metaKeywords: string
  metaTitle: string
  otp: string
  otpAttemp: number
  otpTime: Date
  password: string
  phone: string
  plan: string
  productSold: number
  provider: string
  q: string
  recentlyViewed: [ProductDocument['_id']]
  referralCode: string
  refreshSlug: boolean
  role: string
  roles: [RoleDocument['_id']]
  shippingCharges: number
  sid: string
  slug: string
  store: StoreDocument['_id']
  storeName: string
  twitter: any
  verificationUrl: () => string
  verified: boolean
  verifiedAt: Date
}

interface UserModel extends Model<UserDocument> {
  signVerificationUrl: (url: string) => string
  hasValidVerificationUrl: (path: string, query: any) => boolean
}

export interface InfoDocument extends Document {
  popularity: number
  avgRating: number
  public: boolean
  store: string
  storePhotos: string[]
}

export interface BusinessDetailDocument extends Document {
  accountNo: number
  bankName: string
  ifsc: string
  accountHolderName: string
}
