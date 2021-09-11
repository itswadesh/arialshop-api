import { IResolvers, UserInputError } from 'apollo-server-express'
import { Request, GlobalOptionDocument } from '../types'
import { validate, objectId } from '../validation'
import { GlobalOption, User, Setting, Slug, Store } from '../models'
import { fields, index, generateSlug } from '../utils'
import { Types } from 'mongoose'

const resolvers: IResolvers = {
  Query: {
    globalOptions: async (root, args, { req }: { req: Request }, info) => {
      const { userId } = req.session
      try {
        const user = await User.findById(userId)
        if (!user) args.active = true
        if (user && user.role != 'admin' && user.role !== 'super')
          args.active = true
        args.populate = 'values'
        args.sort = args.sort || 'position'
        //checking store
        const settings = await Setting.findOne()
        if (!settings) throw new Error('Something went wrong')
        let isMultiStore = false
        if (settings.isMultiStore) isMultiStore = true

        return index({ model: GlobalOption, args, info, isMultiStore })
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    globalOption: async (
      root,
      args: { id: string },
      ctx,
      info
    ): Promise<GlobalOptionDocument | null> => {
      try {
        return GlobalOption.findById(args.id, fields(info)).populate('values')
      } catch (e) {
        throw new UserInputError(e)
      }
    },
  },
  Mutation: {
    removeGlobalOption: async (
      root,
      args,
      { req }: { req: Request }
    ): Promise<boolean> => {
      const { userId } = req.session
      try {
        const globalOption = await GlobalOption.findById(args.id)
        if (!globalOption) throw new UserInputError('GlobalOption not found')
        const user = await User.findById(userId)
        if (!user) throw new UserInputError('Please login again to continue')
        if (
          globalOption &&
          globalOption.values &&
          globalOption.values.length > 0
        )
          throw new UserInputError(
            'Can not delete globalOption with globalOptionValues'
          )
        await Slug.deleteOne({ slug: globalOption.slug })
        const o = await GlobalOption.deleteOne({ _id: args.id })
        return o.ok == 1
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    saveGlobalOption: async (
      root,
      args,
      { req }: { req: Request }
    ): Promise<GlobalOptionDocument | null> => {
      try {
        const { userId } = req.session
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
          const globalOption = await GlobalOption.findOne({
            name: args.name,
          }).collation({
            locale: 'tr',
            strength: 1,
          })
          if (globalOption)
            throw new Error(
              'globalOption already exist,can not create new globalOption with same name'
            )
          delete args.id
        }
        const globalOption = await GlobalOption.findOneAndUpdate(
          { _id: args.id || Types.ObjectId() },
          { $set: { ...args, user: userId } },
          { upsert: true, new: true }
        ).populate('values')
        // console.log('the updated globalOption is:', globalOption)
        await globalOption.save() // To fire pre save hoook
        return globalOption
      } catch (e) {
        throw new UserInputError(e)
      }
    },
  },
}
export default resolvers
