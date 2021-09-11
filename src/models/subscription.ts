import mongoose, { Schema } from 'mongoose'
import { SubscriptionDocument } from '../types'

const subscriptionSchema = new Schema(
  {
    active: { type: Boolean, default: true },
    abandonnedCartRecovery: { type: Boolean, default: false },
    annualMonthlyPrice: { type: Number, default: 0 },
    chatSupport: { type: Boolean, default: false },
    customDomain: { type: Boolean, default: false },
    description: { type: String },
    discountCoupons: { type: Boolean, default: false },
    emailSupport: { type: Boolean, default: false },
    freeSSL: { type: Boolean, default: false },
    misReports: { type: Boolean, default: false },
    monthlyPrice: { type: Number, default: 0 },
    name: { type: String, required: true },
    onlineStore: { type: Boolean, default: true },
    premiumSupport: { type: Boolean, default: false },
    productImportExport: { type: Boolean, default: false },
    productsAllowed: { type: Number, default: 0 },
    removeMisikiLogo: { type: Boolean, default: false },
    salesChannels: { type: Boolean, default: false },
    seoOptions: { type: Boolean, default: false },
    title: { type: String },
    transactionFees: { type: Number, default: 0 },
    transactionFeesType: { type: String, default: 'percent' },
    unlimitedProducts: { type: Boolean, default: false },
    unlimitedValidity: { type: Boolean, default: false },
    validityInDays: { type: Number, default: 0 },
  },
  {
    versionKey: false,
    timestamps: true,
  }
)

subscriptionSchema.index({
  '$**': 'text',
})
export const Subscription = mongoose.model<SubscriptionDocument>(
  'Subscription',
  subscriptionSchema
)
