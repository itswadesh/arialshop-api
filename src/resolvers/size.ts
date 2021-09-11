import { IResolvers, UserInputError } from 'apollo-server-express'
import { Request, SizeDocument } from '../types'
import { validate, objectId, couponSchema } from '../validation'
import { Size, User, Setting, Slug, Store } from '../models'
import { fields, index, generateSlug } from '../utils'
import { Types } from 'mongoose'

const resolvers: IResolvers = {
  Query: {
    sizes: async (root, args, { req }: { req: Request }, info) => {
      const { userId } = req.session
      try {
        const user = await User.findById(userId)
        if (!user) args.active = true
        if (user && user.role != 'admin' && user.role !== 'super')
          args.active = true
        //checking store
        const settings = await Setting.findOne()
        if (!settings) throw new Error('Something went wrong')
        let isMultiStore = false
        if (settings.isMultiStore) {
          isMultiStore = true
          args.populate = 'store'
        }
        return index({ model: Size, args, info, isMultiStore })
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    size: async (
      root,
      args: { id: string },
      ctx,
      info
    ): Promise<SizeDocument | null> => {
      try {
        return Size.findById(args.id, fields(info)).populate('store')
      } catch (e) {
        throw new UserInputError(e)
      }
    },
  },
  Mutation: {
    removeSize: async (
      root,
      args,
      { req }: { req: Request }
    ): Promise<boolean | null> => {
      const { userId } = req.session
      try {
        const size = await Size.findById(args.id)
        if (!size) throw new UserInputError('Size not found')
        const user = await User.findById(userId)
        if (!user) throw new UserInputError('Please login again to continue')
        await Slug.deleteOne({ slug: size.slug })
        const s = await Size.deleteOne({ _id: args.id })
        return s.ok == 1
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    saveSize: async (
      root,
      args,
      { req }: { req: Request }
    ): Promise<SizeDocument | null> => {
      try {
        const { userId } = req.session
        //checking store
        const settings = await Setting.findOne()
        if (!settings) throw new Error('Something went wrong')
        let storeId
        if (settings.isMultiStore) {
          const user = await User.findById(userId)
          if (!user.store) throw new Error('You have not own a store')
          const store = await Store.findById(user.store)
          if (!store) throw new Error('Your store does not exist')
          args.store = store._id
          storeId = store._id
        }
        if (args.id == 'new') {
          const size = await Size.findOne({
            name: args.name,
            store: storeId,
          }).collation({
            locale: 'tr',
            strength: 1,
          })
          if (size)
            throw new Error(
              'size already existed,can not create new size with same name'
            )
          delete args.id
        }
        const size = await Size.findOneAndUpdate(
          { _id: args.id || Types.ObjectId() },
          { $set: { ...args, user: userId } },
          { upsert: true, new: true }
        )
        // console.log('the updated size is:', size)
        await size.save() // To fire pre save hoook
        return size
      } catch (e) {
        throw new UserInputError(e)
      }
    },
  },
}

export default resolvers
