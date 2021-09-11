import { IResolvers, UserInputError } from 'apollo-server-express'
import { Request, DiscountDocument } from '../types'
import { Discount, Setting, Slug, Store, User } from '../models'
import { fields, index, generateSlug } from '../utils'
import { Types } from 'mongoose'

const resolvers: IResolvers = {
  Query: {
    discounts: async (root, args, { req }: { req: Request }, info) => {
      try {
        //checking store
        const settings = await Setting.findOne()
        if (!settings) throw new Error('Something went wrong')
        let isMultiStore = false
        if (settings.isMultiStore) isMultiStore = true

        return index({ model: Discount, args, info, isMultiStore })
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    discount: async (
      root,
      args: { id: string },
      ctx,
      info
    ): Promise<DiscountDocument | null> => {
      try {
        return Discount.findById(args.id, fields(info)).populate('seller')
      } catch (e) {
        throw new UserInputError(e)
      }
    },
  },
  Mutation: {
    deleteDiscount: async (
      root,
      args,
      { req }: { req: Request }
    ): Promise<boolean> => {
      try {
        const discount = await Discount.findById(args.id)
        if (discount) {
          await Discount.findByIdAndDelete(args.id)
          return true
        } else {
          return false
        }
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    saveDiscount: async (
      root,
      args,
      { req }: { req: Request }
    ): Promise<DiscountDocument | null> => {
      const { userId } = req.session
      try {
        //checking store
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
          const discount = await Discount.findOne({
            name: args.name,
          }).collation({
            locale: 'tr',
            strength: 1,
          })
          if (discount) throw new Error('discount already existed')
          delete args.id
          if (!args.description) throw new Error('description is compulsory')
        }
        const discount = await Discount.findOneAndUpdate(
          { _id: args.id || Types.ObjectId() },
          { $set: { ...args } },
          { upsert: true, new: true }
        )
        // console.log('the updated discount is:', discount)
        await discount.save() // To fire pre save hoook
        return discount
      } catch (e) {
        throw new UserInputError(e)
      }
    },
  },
}

export default resolvers
