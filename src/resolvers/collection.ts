import { IResolvers, UserInputError } from 'apollo-server-express'
import { Request, CollectionDocument } from '../types'
import { Collection, User, Slug, Product, Setting, Store } from '../models'
import { fields, index, generateSlug } from '../utils'
import { Types } from 'mongoose'

const resolvers: IResolvers = {
  Query: {
    collections: async (root, args, { req }: { req: Request }, info) => {
      try {
        args.populate = 'products store'
        const settings = await Setting.findOne()
        if (!settings) throw new Error('Something went wrong')
        let isMultiStore = false
        if (settings.isMultiStore) isMultiStore = true

        return index({ model: Collection, args, info, isMultiStore })
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    collection: async (
      root,
      args: { id: string },
      ctx,
      info
    ): Promise<CollectionDocument | null> => {
      try {
        return Collection.findById(args.id, fields(info)).populate(
          'user products store'
        )
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    collectionsProducts: async (
      _root,
      args,
      { req }: { req: Request },
      info
    ) => {
      args.collections = {
        $in: args.ids,
      }
      delete args.ids
      try {
        return index({ model: Product, args, info })
      } catch (e) {
        throw new UserInputError(e)
      }
    },
  },
  Mutation: {
    deleteCollection: async (
      root,
      args,
      { req }: { req: Request }
    ): Promise<boolean> => {
      try {
        const collection = await Collection.findById(args.id)
        if (collection) {
          await Collection.findByIdAndDelete(args.id)
          return true
        } else {
          return false
        }
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    saveCollection: async (
      root,
      args,
      { req }: { req: Request }
    ): Promise<CollectionDocument | null> => {
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
          const collection = await Collection.findOne({
            name: args.name,
          }).collation({
            locale: 'tr',
            strength: 1,
          })
          if (collection) throw new Error('collection already existed')
          delete args.id
        }
        const collection = await Collection.findOneAndUpdate(
          { _id: args.id || Types.ObjectId() },
          { $set: { ...args, user: userId } },
          { upsert: true, new: true }
        )
        // console.log('the updated collection is:', collection)
        await collection.save() // To fire pre save hoook
        if (args.products) {
          for (let pId of args.products) {
            await Product.updateOne(
              { _id: pId },
              { $addToSet: { collections: collection._id } },
              { new: true }
            )
          }
        }
        return collection
      } catch (e) {
        throw new UserInputError(e)
      }
    },
  },
}

export default resolvers
