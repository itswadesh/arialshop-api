import { IResolvers, UserInputError } from 'apollo-server-express'
import { Request, CustomerMessageDocument } from '../types'
import { validate, objectId } from '../validation'
import { CustomerMessage, Setting, Store, User } from '../models'
import { fields, index } from '../utils'
import { Types } from 'mongoose'

const resolvers: IResolvers = {
  Query: {
    customerMessages: async (root, args, { req }: { req: Request }, info) => {
      try {
        args.populate = 'store'
        const settings = await Setting.findOne()
        if (!settings) throw new Error('Something went wrong')
        let isMultiStore = false
        if (settings.isMultiStore) isMultiStore = true

        return index({ model: CustomerMessage, args, info, isMultiStore })
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    customerMessage: async (
      root,
      args: { id: string },
      ctx,
      info
    ): Promise<CustomerMessageDocument | null> => {
      try {
        return CustomerMessage.findById(args.id, fields(info)).populate('store')
      } catch (e) {
        throw new UserInputError(e)
      }
    },
  },
  Mutation: {
    deleteCustomerMessage: async (
      root,
      args,
      { req }: { req: Request }
    ): Promise<boolean> => {
      const { userId } = req.session
      try {
        await CustomerMessage.findByIdAndDelete({
          _id: args.id,
        })
        return true
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    deleteAllCustomerMessage: async (
      root,
      args,
      { req }: { req: Request }
    ): Promise<boolean> => {
      try {
        const messages = await CustomerMessage.find()
        for (const customerMessage of messages) {
          await CustomerMessage.findByIdAndDelete({
            _id: customerMessage.id,
          })
        }
        return true
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    saveCustomerMessage: async (
      root,
      args,
      { req }: { req: Request }
    ): Promise<CustomerMessageDocument | null> => {
      try {
        const { userId } = req.session
        const settings = await Setting.findOne()
        if (!settings) throw new Error('Something went wrong')
        if (settings.isMultiStore) {
          const user = await User.findById(userId)
          if (!user.store) throw new Error('You have not own a store')
          const store = await Store.findById(user.store)
          if (!store) throw new Error('Your store does not exist')
          args.store = store._id
        }
        if (args.id == 'new') delete args.id
        const customerMessage = await CustomerMessage.findOneAndUpdate(
          { _id: args.id || Types.ObjectId() },
          { $set: { ...args } },
          { upsert: true, new: true }
        )
        return customerMessage
      } catch (e) {
        throw new UserInputError(e)
      }
    },
  },
}

export default resolvers
