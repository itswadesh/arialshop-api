import { IResolvers, UserInputError } from 'apollo-server-express'
import { Request, DealDocument } from '../types'
import { objectId } from '../validation'
import { Deal, Product, Setting, Slug, Store, User } from '../models'
import { fields, index, toJson } from '../utils'
import { ObjectId } from 'mongodb'

const resolvers: IResolvers = {
  Query: {
    deals: async (root, args, { req }: { req: Request }, info) => {
      args.populate = 'products store'
      args.sort = 'dealStatus'
      try {
        //checking store
        const settings = await Setting.findOne()
        if (!settings) throw new Error('Something went wrong')
        let isMultiStore = false
        if (settings.isMultiStore) isMultiStore = true

        return index({ model: Deal, args, info, isMultiStore })
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    listDeals: async (root, args, { req }: { req: Request }, info) => {
      args.populate = 'products store'
      args.dealStatus = true
      args.sort = 'endTimeISO'
      try {
        //checking store
        const settings = await Setting.findOne()
        if (!settings) throw new Error('Something went wrong')
        let isMultiStore = false
        if (settings.isMultiStore) isMultiStore = true

        return index({ model: Deal, args, info, isMultiStore })
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    deal: async (
      root,
      args: { id: string; slug: string },
      ctx,
      info
    ): Promise<DealDocument | null> => {
      try {
        await objectId.validateAsync(args)
        return Deal.findById(args.id, fields(info)).populate('products store')
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    dealOne: async (
      root,
      args: { id: string; slug: string },
      ctx,
      info
    ): Promise<DealDocument | null> => {
      try {
        await objectId.validateAsync(args)
        return Deal.findById(args.id, fields(info))
      } catch (e) {
        throw new UserInputError(e)
      }
    },
  },
  Mutation: {
    createDeal: async (
      root,
      args,
      { req }: { req: Request }
    ): Promise<DealDocument | null> => {
      args.startTimeISO = args.startTime
      args.endTimeISO = args.endTime
      try {
        //checking store
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
        const data = await Deal.create(args)
        await Product.updateMany(
          { _id: { $in: args.products } },
          { $set: { deal: data._id } }
        )
        return data
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    saveDeal: async (
      root,
      args,
      { req }: { req: Request }
    ): Promise<DealDocument | null> => {
      const { userId } = req.session
      args.startTimeISO = args.startTime
      args.endTimeISO = args.endTime
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
        let deal
        if (args.id == 'new') {
          deal = await Deal.create(args)
        } else {
          if (!ObjectId.isValid(args.id)) {
            throw new UserInputError('Record not found')
          }
          deal = await Deal.findOneAndUpdate(
            { _id: args.id },
            { ...args, user: userId },
            { new: true, upsert: true }
          )
          await deal.save() // To fire pre save hoook
        }
        return deal
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    updateDeal: async (
      root,
      args,
      { req }: { req: Request }
    ): Promise<DealDocument | null> => {
      const { userId } = req.session
      try {
        if (!ObjectId.isValid(args.id))
          throw new UserInputError('No Deal found to update')
        if (args.startTime) {
          args.startTimeISO = args.startTime
        }
        if (args.endTime) {
          args.endTimeISO = args.endTime
        }
        const data = await Deal.updateOne({ _id: args.id }, { $set: args })
        const updated = await Deal.findOne({ _id: args.id })
        return updated
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    removeDeal: async (
      root,
      args,
      { req }: { req: Request }
    ): Promise<boolean | null> => {
      try {
        if (!ObjectId.isValid(args.id))
          throw new UserInputError('No Deal found to update')
        let deal = await Deal.findOne({ _id: args.id })
        deal = JSON.parse(JSON.stringify(deal))
        if (!deal) throw new UserInputError('Deal not found')
        await Product.updateMany(
          { _id: { $in: deal.products } },
          { $unset: { deal: '' } }
        )
        const d = await Deal.remove({ _id: args.id })
        return true
      } catch (e) {
        throw new UserInputError(e)
      }
    },
  },
}

export default resolvers
