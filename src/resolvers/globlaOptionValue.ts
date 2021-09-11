import { IResolvers, UserInputError } from 'apollo-server-express'
import { Request, GlobalOptionValueDocument } from '../types'
import { validate, objectId } from '../validation'
import {
  GlobalOption,
  GlobalOptionValue,
  Setting,
  Store,
  User,
} from '../models'
import { fields, index } from '../utils'
import { Types, Schema } from 'mongoose'

const resolvers: IResolvers = {
  Query: {
    globalOptionValues: async (root, args, { req }: { req: Request }, info) => {
      const { userId } = req.session
      try {
        const user = await User.findById(userId)
        if (!user) args.active = true
        if (user && user.role != 'admin' && user.role !== 'super')
          args.active = true
        args.sort = args.sort || 'position'
        //checking store
        const settings = await Setting.findOne()
        if (!settings) throw new Error('Something went wrong')
        let isMultiStore = false
        if (settings.isMultiStore) isMultiStore = true

        return index({ model: GlobalOptionValue, args, info, isMultiStore })
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    globalOptionValue: async (
      root,
      args: { id: string },
      ctx,
      info
    ): Promise<GlobalOptionValueDocument | null> => {
      try {
        return GlobalOptionValue.findById(args.id, fields(info))
      } catch (e) {
        throw new UserInputError(e)
      }
    },
  },
  Mutation: {
    removeGlobalOptionValue: async (
      root,
      args,
      { req }: { req: Request }
    ): Promise<boolean> => {
      const { userId } = req.session
      try {
        const globalOptionValue = await GlobalOptionValue.findById(args.id)
        if (!globalOptionValue)
          throw new UserInputError('globalOptionValue not found')
        await GlobalOption.findOneAndUpdate(
          { _id: globalOptionValue.global_option_id },
          { $pull: { values: args.id } },
          { new: true }
        )
        await GlobalOptionValue.deleteOne({ _id: args.id })
        return true
      } catch (e) {
        throw new UserInputError(e)
      }
    },

    saveGlobalOptionValue: async (
      root,
      args,
      { req }: { req: Request }
    ): Promise<GlobalOptionValueDocument | null> => {
      const { userId } = req.session
      const { global_option_id } = args
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
          delete args.id
          const check = await GlobalOption.findById(global_option_id)
          if (!check) throw new UserInputError('globalOption not found')
          const globalOptionValue = await GlobalOptionValue.findOne({
            name: args.name,
            global_option_id: args.global_option_id,
          }).collation({
            locale: 'tr',
            strength: 1,
          })
          if (globalOptionValue)
            throw new Error(
              'globalOptionValue already existed in this GlobalOption,can not create new globalOptionValue with same name in this GlobalOption'
            )
        }
        const globalOptionValue = await GlobalOptionValue.findOneAndUpdate(
          { _id: args.id || Types.ObjectId() },
          { $set: { ...args, user: userId } },
          { upsert: true, new: true }
        )
        await globalOptionValue.save() // To fire pre save hoook
        await GlobalOption.updateOne(
          { _id: global_option_id },
          { $addToSet: { values: globalOptionValue._id } }
        )
        return globalOptionValue
      } catch (e) {
        throw new UserInputError(e)
      }
    },
  },
}

export default resolvers
