import { IResolvers, UserInputError } from 'apollo-server-express'
import { Request, OptionDocument } from '../types'
import { validate, objectId } from '../validation'
import { Option, Product, Setting, Slug, Store, User } from '../models'
import { fields, index, generateSlug } from '../utils'
import { Types } from 'mongoose'

const resolvers: IResolvers = {
  Query: {
    options: async (root, args, { req }: { req: Request }, info) => {
      const { userId } = req.session
      const user = await User.findById(userId)
      if (!user) args.active = true
      if (user && user.role != 'admin' && user.role !== 'super')
        args.active = true
      args.populate = 'values'
      args.sort = args.sort || 'position'

      try {
        //checking store
        const settings = await Setting.findOne()
        if (!settings) throw new Error('Something went wrong')
        let isMultiStore = false
        if (settings.isMultiStore) isMultiStore = true

        return index({ model: Option, args, info, isMultiStore })
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    option: async (
      root,
      args: { id: string },
      ctx,
      info
    ): Promise<OptionDocument | null> => {
      try {
        return Option.findById(args.id, fields(info)).populate('values')
      } catch (e) {
        throw new UserInputError(e)
      }
    },
  },
  Mutation: {
    removeOption: async (
      root,
      args,
      { req }: { req: Request }
    ): Promise<boolean> => {
      const { userId } = req.session
      try {
        const option = await Option.findById(args.id)
        if (!option) throw new UserInputError('Option not found')
        const user = await User.findById(userId)
        if (!user) throw new UserInputError('Please login again to continue')
        // @ts-ignore
        if (option && option.values && option.values.length > 0)
          throw new UserInputError('Can not delete Option with OptionValues')
        await Product.updateOne(
          { _id: option.pid },
          { $pull: { options: args.id } }
        )
        await Slug.deleteOne({ slug: option.slug })
        const o = await Option.deleteOne({ _id: args.id })
        return o.ok == 1
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    saveOption: async (
      root,
      args,
      { req }: { req: Request }
    ): Promise<OptionDocument | null> => {
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
          const product = await Product.findById(args.pid)
          if (!product) throw new Error('product not found')
          const option = await Option.findOne({
            name: args.name,
            pid: args.pid,
          }).collation({
            locale: 'tr',
            strength: 1,
          })
          if (option)
            throw new Error(
              'option already existed in this product,can not create new option with same name in this product'
            )
          delete args.id
        }
        const option = await Option.findOneAndUpdate(
          { _id: args.id || Types.ObjectId() },
          { $set: { ...args, user: userId } },
          { upsert: true, new: true }
        ).populate('values')
        // console.log('the updated option is:', option)
        await option.save() // To fire pre save hoook
        await Product.findByIdAndUpdate(args.pid, {
          $addToSet: { options: option._id },
        })
        return option
      } catch (e) {
        throw new UserInputError(e)
      }
    },
  },
}

export default resolvers
