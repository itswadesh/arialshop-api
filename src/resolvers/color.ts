import { IResolvers, UserInputError } from 'apollo-server-express'
import { Request, ColorDocument } from '../types'
import { validate, objectId, couponSchema } from '../validation'
import { Color, Setting, Slug, Store, User } from '../models'
import { fields, index, generateSlug } from '../utils'
import { Types } from 'mongoose'

const resolvers: IResolvers = {
  Query: {
    colors: async (root, args, { req }: { req: Request }, info) => {
      const { userId } = req.session
      try {
        const user = await User.findById(userId)
        if (!user) args.active = true
        if (user && user.role != 'admin' && user.role !== 'super')
          args.active = true
        args.populate = 'store'
        const settings = await Setting.findOne()
        if (!settings) throw new Error('Something went wrong')
        let isMultiStore = false
        if (settings.isMultiStore) isMultiStore = true

        return index({ model: Color, args, info, isMultiStore })
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    color: async (
      root,
      args: { id: string },
      ctx,
      info
    ): Promise<ColorDocument | null> => {
      try {
        return Color.findById(args.id, fields(info)).populate('store')
      } catch (e) {
        throw new UserInputError(e)
      }
    },
  },
  Mutation: {
    removeColor: async (
      root,
      args,
      { req }: { req: Request }
    ): Promise<boolean> => {
      const { userId } = req.session
      try {
        const user = await User.findById(userId)
        if (!user) throw new UserInputError('Please login again to continue')
        const color: any = await Color.findByIdAndDelete({ _id: args.id })
        if (color) {
          await Slug.deleteOne({ slug: color.slug })
          return true
        } else {
          return false
        }
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    saveColor: async (
      root,
      args,
      { req }: { req: Request }
    ): Promise<ColorDocument | null> => {
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
          if (!args.color_code) throw new Error('color_code not provided')
          const color = await Color.findOne({
            color_code: args.color_code,
          }).collation({
            locale: 'tr',
            strength: 1,
          })
          if (color)
            throw new Error(
              'color already existed,can not create new color with same colot_code'
            )
          delete args.id
        }
        const color = await Color.findOneAndUpdate(
          { _id: args.id || Types.ObjectId() },
          { $set: { ...args, user: userId } },
          { upsert: true, new: true }
        )
        // console.log('the updated color is:', color)
        await color.save() // To fire pre save hoook
        return color
      } catch (e) {
        throw new UserInputError(e)
      }
    },
  },
}

export default resolvers
