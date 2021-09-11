import { Schema, model, Document, Model } from 'mongoose'
import { hash, compare } from 'bcryptjs'
import { createHash, createHmac, timingSafeEqual } from 'crypto'
import {
  BCRYPT_WORK_FACTOR,
  APP_SECRET,
  EMAIL_VERIFICATION_TIMEOUT,
  WWW_URL,
} from '../config'
import { UserDocument, UserModel } from '../types'
import { generateSlug } from '../utils'
const { ObjectId } = Schema.Types

export const userSchema = new Schema(
  {
    phone: {
      type: String,
      // validate: [
      //   async (phone: string): Promise<boolean> =>
      //     !(await User.exists({ phone })),
      //   'Phone is already registered.',
      // ],
    },
    email: {
      type: String,
      // validate: [
      //   async (email: string): Promise<boolean> =>
      //     !(await User.exists({ email })),
      //   'Email is already registered.',
      // ],
    },
    active: { type: Boolean, default: true },
    address: [{ type: ObjectId, ref: 'Address' }],
    avatar: { type: String },
    avgRating: { type: Number, default: 0 },
    banner: { type: String },
    businessDetail: {
      accountNo: { type: Number },
      bankName: { type: String },
      ifsc: { type: String },
      accountHolderName: { type: String },
    },
    cartId: { type: ObjectId, ref: 'Cart' },
    city: { type: String },
    createdBy: { type: ObjectId, ref: 'User' },
    currentBalance: { type: Number, default: 0 }, //wallet
    facebook: { type: Object },
    firstName: { type: String, es_indexed: true },
    lastName: { type: String, es_indexed: true },
    freeShippingOn: { type: Number, default: 0 }, // FREE Shipping on orders over ₹ 499.00
    gender: { type: String },
    github: { type: Object },
    google: { type: Object },
    info: { type: Object, default: {} },
    lastSignIn: { type: Date }, // last signed in
    luluCustomerNo: { type: String },
    meta: { type: String },
    metaDescription: { type: String },
    metaKeywords: { type: String },
    metaTitle: { type: String },
    otpAttemp: { type: Number, default: 0 }, //otp attemp count
    otpTime: { type: Date }, //last otp attemp time
    password: { type: String },
    plan: { type: String, default: 'free' },
    productSold: { type: Number, default: 0 },
    provider: { type: String, default: 'local' },
    ratings: { type: Number, default: 0 }, //only for  vendor
    recentlyViewed: [{ type: ObjectId, ref: 'Product' }], //last ten visited product
    referedFrom: { type: ObjectId, ref: 'User' }, //referral
    referedUsers: [{ type: ObjectId, ref: 'User' }], //referral
    referralCode: { type: String },
    reviews: { type: Number, default: 0 },
    role: { type: String, default: 'user' },
    roles: [{ type: ObjectId, ref: 'Role' }],
    shippingCharges: { type: Number, default: 0 }, //for vendor
    slug: { type: String },
    store: { type: ObjectId, ref: 'Store' },
    storeName: { type: String },
    twitter: { type: Object },
    verified: { type: Boolean, default: false },
    walletId: [{ type: ObjectId, ref: 'Wallet' }], //referral
    wishlistId: { type: ObjectId, ref: 'Wishlist' },
  },
  {
    versionKey: false,
    timestamps: true,
  }
)
userSchema.virtual('name').get(function () {
  return `${this.firstName || ''} ${this.lastName || ''}`
})
userSchema.pre<UserDocument>('save', async function () {
  if (this.isModified('password')) {
    this.password = await hash(this.password, BCRYPT_WORK_FACTOR)
  }

  if (!this.slug && this.role != 'user')
    this.slug = await generateSlug(
      this.firstName + ' ' + this.lastName,
      'user',
      this.slug,
      'number',
      this.store
    )
})
//password matching functionality
userSchema.methods.matchesPassword = function (password: string) {
  const u: any = this
  return compare(password, u.password)
}

userSchema.statics.referalUrl = function (uid: string) {
  return `${WWW_URL}/signup?referer=${uid}`
}

userSchema.methods.verificationUrl = function () {
  const e: any = this
  const token = createHash('sha1').update(e.email).digest('hex')
  const expires = Date.now() + EMAIL_VERIFICATION_TIMEOUT

  const url = `${WWW_URL}/account/verify?id=${this.id}&token=${token}&expires=${expires}`
  // @ts-ignore
  const signature = User.signVerificationUrl(url)

  return `${url}&signature=${signature}`
}

userSchema.statics.signVerificationUrl = (url: string) =>
  createHmac('sha256', APP_SECRET).update(url).digest('hex')

userSchema.statics.hasValidVerificationUrl = function (
  path: string,
  query: any
) {
  const url = `${WWW_URL}${path}`
  const original = url.slice(0, url.lastIndexOf('&'))
  // @ts-ignore
  const signature = User.signVerificationUrl(original)

  return (
    timingSafeEqual(Buffer.from(signature), Buffer.from(query.signature)) &&
    +query.expires > Date.now()
  )
}

userSchema.set('toJSON', {
  transform: (doc: any, { __v, password, ...rest }: any, options: any) => rest,
})
userSchema.index({
  '$**': 'text',
})
// @ts-ignore
export const User = model<UserDocument, UserModel>('User', userSchema)
