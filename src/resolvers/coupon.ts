import { IResolvers, UserInputError } from 'apollo-server-express'
import { Request, CouponDocument } from '../types'
import { validate, objectId, couponSchema } from '../validation'
import { Coupon, Setting, Store, User } from '../models'
import {
  fields,
  calculateSummary,
  index,
  validateCart,
  validateCoupon,
} from '../utils'
import { Types } from 'mongoose'

const resolvers: IResolvers = {
  Query: {
    couponsAdmin: async (root, args, { req }: { req: Request }, info) => {
      try {
        args.populate = 'store'
        const settings = await Setting.findOne()
        if (!settings) throw new Error('Something went wrong')
        let isMultiStore = false
        if (settings.isMultiStore) isMultiStore = true

        return index({ model: Coupon, args, info, isMultiStore })
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    coupons: async (root, args, { req }: { req: Request }, info) => {
      args.active = true
      args.validFromDate = { $lte: new Date() }
      args.validToDate = { $gte: new Date() }
      args.populate = 'store'
      try {
        const settings = await Setting.findOne()
        if (!settings) throw new Error('Something went wrong')
        let isMultiStore = false
        if (settings.isMultiStore) isMultiStore = true

        return index({ model: Coupon, args, info, isMultiStore })
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    coupon: async (
      root,
      args: { id: string },
      ctx,
      info
    ): Promise<CouponDocument | null> => {
      try {
        await objectId.validateAsync(args)
        return Coupon.findById(args.id, fields(info)).populate('store')
      } catch (e) {
        throw new UserInputError(e)
      }
    },
  },
  Mutation: {
    applyCoupon: async (
      root,
      args,
      { req }: { req: Request }
    ): Promise<any> => {
      try {
        await validateCoupon(req.session.cart, args.code, false) // 3rd param true= Silent no error. hence this line is required here
        await calculateSummary(req, args.code)
        return req.session.cart
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    removeCoupon: async (
      root,
      args,
      { req }: { req: Request }
    ): Promise<any> => {
      try {
        await calculateSummary(req, '')
        return req.session.cart
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    saveCoupon: async (
      root,
      args,
      { req }: { req: Request }
    ): Promise<CouponDocument | null> => {
      const { userId } = req.session
      try {
        const settings = await Setting.findOne()
        if (!settings) throw new Error('Something went wrong')
        if (settings.isMultiStore) {
          const user = await User.findById(userId)
          if (!user.store) throw new Error('You have not own a store')
          const store = await Store.findById(user.store)
          if (!store) throw new Error('Your store does not exist')
          args.store = store._id
        }
        if (args.id == 'new') {
          const coupon = await Coupon.findOne({ code: args.code }).collation({
            locale: 'tr',
            strength: 1,
          })
          if (coupon)
            throw new Error(
              'coupon already existed,can not create new coupon with same code'
            )
          delete args.id
        }
        const coupon = await Coupon.findOneAndUpdate(
          { _id: args.id || Types.ObjectId() },
          { ...args, uid: userId },
          { new: true, upsert: true }
        )
        await coupon.save() // To fire pre save hoook
        return coupon
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    createCoupon: async (
      root,
      args: {
        code: string
        value: number
        type: string
        info: string
        msg: string
        text: string
        terms: string
        minimumCartValue: number
        maxAmount: number
        from: string
        to: string
        active: boolean
        store: string
      },
      { req }: { req: Request }
    ): Promise<CouponDocument> => {
      try {
        await validate(couponSchema, args)
        const { userId } = req.session
        const coupon = new Coupon({ ...args, uid: userId })
        await coupon.save()
        // const coupon = await Coupon.create({ ...args, uid: userId })
        // await coupon.save()
        return coupon
      } catch (e) {
        throw new UserInputError(e)
      }
    },
  },
}

export default resolvers
