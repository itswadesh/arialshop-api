import { IResolvers, UserInputError } from 'apollo-server-express'
import { Request, UnitDocument } from '../types'
import { validate, objectId, couponSchema } from '../validation'
import { Unit, User, Slug, Setting, Store } from '../models'
import { fields, index, generateSlug } from '../utils'
import { Types } from 'mongoose'

const resolvers: IResolvers = {
  Query: {
    units: async (root, args, { req }: { req: Request }, info) => {
      const { userId } = req.session
      try {
        const user = await User.findById(userId)
        if (!user) args.active = true
        if (user && user.role != 'admin' && user.role != 'super')
          args.active = true
        //checking store
        const settings = await Setting.findOne()
        if (!settings) throw new Error('Something went wrong')
        let isMultiStore = false
        if (settings.isMultiStore) {
          isMultiStore = true
          args.populate = 'store'
        }
        return index({ model: Unit, args, info, isMultiStore })
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    unit: async (
      root,
      args: { id: string },
      ctx,
      info
    ): Promise<UnitDocument | null> => {
      try {
        return Unit.findById(args.id, fields(info)).populate('store')
      } catch (e) {
        throw new UserInputError(e)
      }
    },
  },
  Mutation: {
    removeUnit: async (
      root,
      args,
      { req }: { req: Request }
    ): Promise<boolean> => {
      const { userId } = req.session
      try {
        const unit = await Unit.findById(args.id)
        if (!unit) throw new UserInputError('Unit not found')
        const user = await User.findById(userId)
        if (!user) throw new UserInputError('Please login again to continue')
        await Slug.deleteOne({ slug: unit.slug })
        const s = await Unit.deleteOne({ _id: args.id })
        return s.ok == 1
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    saveUnit: async (
      root,
      args,
      { req }: { req: Request }
    ): Promise<UnitDocument | null> => {
      if (args.id == 'new') delete args.id
      const { userId } = req.session
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
        const unit = await Unit.findOneAndUpdate(
          { _id: args.id || Types.ObjectId() },
          { $set: { ...args, user: userId } },
          { upsert: true, new: true }
        )
        // console.log('the updated unit is:', unit)
        await unit.save() // To fire pre save hoook
        return unit
      } catch (e) {
        throw new UserInputError(e)
      }
    },
  },
}

export default resolvers
