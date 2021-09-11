import { IResolvers, UserInputError } from 'apollo-server-express'
import { Request, OptionValueDocument } from '../types'
import { validate, objectId } from '../validation'
import { Option, OptionValue, Setting, Store, User } from '../models'
import { fields, index } from '../utils'
import { Types, Schema } from 'mongoose'

const resolvers: IResolvers = {
  Query: {
    optionValues: async (root, args, { req }: { req: Request }, info) => {
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

        return index({ model: OptionValue, args, info, isMultiStore })
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    optionValue: async (
      root,
      args: { id: string },
      ctx,
      info
    ): Promise<OptionValueDocument | null> => {
      try {
        return OptionValue.findById(args.id, fields(info))
      } catch (e) {
        throw new UserInputError(e)
      }
    },
  },
  Mutation: {
    removeOptionValue: async (
      root,
      args,
      { req }: { req: Request }
    ): Promise<boolean> => {
      const { userId } = req.session
      try {
        const optionValue = await OptionValue.findById(args.id)
        if (!optionValue) throw new UserInputError('OptionValue not found')
        await Option.findOneAndUpdate(
          { _id: optionValue.option_id },
          // @ts-ignore
          { $pull: { values: args.id } },
          { new: true }
        )
        await OptionValue.deleteOne({ _id: args.id })
        return true
      } catch (e) {
        throw new UserInputError(e)
      }
    },

    saveOptionValue: async (
      root,
      args,
      { req }: { req: Request }
    ): Promise<OptionValueDocument | null> => {
      const { userId } = req.session
      const { option_id } = args
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
          const check = await Option.findById(option_id)
          if (!check) throw new UserInputError('Option not found')
          const optionValue = await OptionValue.findOne({
            name: args.name,
            option_id: args.option_id,
          }).collation({
            locale: 'tr',
            strength: 1,
          })
          if (optionValue)
            throw new Error(
              'optionValue already existed in this Option,can not create new optionValue with same name in this Option'
            )
        }
        const optionValue = await OptionValue.findOneAndUpdate(
          { _id: args.id || Types.ObjectId() },
          { $set: { ...args, user: userId } },
          { upsert: true, new: true }
        )
        await optionValue.save() // To fire pre save hoook
        await Option.updateOne(
          { _id: option_id },
          { $addToSet: { values: optionValue._id } }
        )
        return optionValue
      } catch (e) {
        throw new UserInputError(e)
      }
    },
  },
}

export default resolvers
