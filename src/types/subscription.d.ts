import { Document } from 'mongoose'

export interface SubscriptionDocument extends Document {
  abandonnedCartRecovery: boolean
  active: boolean
  annualMonthlyPrice: number
  chatSupport: boolean
  customDomain: boolean
  description: string
  discountCoupons: boolean
  emailSupport: boolean
  freeSSL: boolean
  misReports: boolean
  monthlyPrice: number
  name: string
  onlineStore: boolean
  premiumSupport: boolean
  productImportExport: boolean
  productsAllowed: number
  removeMisikiLogo: boolean
  salesChannels: boolean
  seoOptions: boolean
  title: string
  transactionFees: number
  transactionFeesType: number
  unlimitedProducts: boolean
  unlimitedValidity: boolean
  validityInDays: number
}
