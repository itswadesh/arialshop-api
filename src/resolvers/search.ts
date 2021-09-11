import { IResolvers, UserInputError } from 'apollo-server-express'
import { Request, SearchDocument } from '../types'
import { validate, objectId } from '../validation'
import { User, Search, Store, Setting } from '../models'
import { fields, index } from '../utils'
import { Types } from 'mongoose'

const resolvers: IResolvers = {
  Query: {
    popularSearches: async (root, args, { req }: { req: Request }, info) => {
      try {
        //checking store
        const settings = await Setting.findOne()
        if (!settings) throw new Error('Something went wrong')
        let isMultiStore = false
        if (settings.isMultiStore) {
          isMultiStore = true
          args.populate = 'store'
        }
        return index({ model: Search, args, info, isMultiStore })
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    popularSearch: async (
      root,
      args: { id: string },
      ctx,
      info
    ): Promise<SearchDocument | null> => {
      try {
        return Search.findById(args.id, fields(info)).populate('store')
      } catch (e) {
        throw new UserInputError(e)
      }
    },
  },
  Mutation: {
    deletePopularSearch: async (
      root,
      args,
      { req }: { req: Request }
    ): Promise<boolean> => {
      const { userId } = req.session
      try {
        const search = await Search.findByIdAndDelete({
          _id: args.id,
        })
        if (search) return true
        return false
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    deleteAllPopularSearch: async (
      root,
      args,
      { req }: { req: Request }
    ): Promise<number> => {
      try {
        const messages = await Search.find()
        if (messages.length < 0) throw new Error('not popular seach for delete')
        for (const customerMessage of messages) {
          await Search.findByIdAndDelete({
            _id: customerMessage.id,
          })
        }
        return messages.length
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    savePopularSearch: async (
      root,
      args,
      { req }: { req: Request }
    ): Promise<SearchDocument | null> => {
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
        if (args.id == 'new') delete args.id
        const popularSearch = await Search.findOneAndUpdate(
          { _id: args.id || Types.ObjectId() },
          { $set: { ...args } },
          { upsert: true, new: true }
        )
        return popularSearch
      } catch (e) {
        throw new UserInputError(e)
      }
    },
  },
}

export default resolvers
