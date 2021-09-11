import { IResolvers, UserInputError } from 'apollo-server-express'
import { Request, ShippingMethodDocument } from '../types'
import { User, ShippingMethod } from '../models'
import { fields, index } from '../utils'
import { Types } from 'mongoose'

const resolvers: IResolvers = {
  Query: {
    shippingMethods: async (root, args, { req }: { req: Request }, info) => {
      const { userId } = req.session
      try {
        const user = await User.findById(userId)
        if (!user) args.active = true
        if (user && user.role != 'admin' && user.role !== 'super')
          args.active = true
        return index({ model: ShippingMethod, args, info })
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    shippingMethod: async (
      root,
      args: { id: string },
      ctx,
      info
    ): Promise<ShippingMethodDocument | null> => {
      try {
        return ShippingMethod.findById(args.id, fields(info))
      } catch (e) {
        throw new UserInputError(e)
      }
    },
  },
  Mutation: {
    removeShippingMethod: async (
      root,
      args,
      { req }: { req: Request }
    ): Promise<boolean | null> => {
      const { userId } = req.session
      try {
        const shippingMethod = await ShippingMethod.findById(args.id)
        if (!shippingMethod)
          throw new UserInputError('ShippingMethod not found')
        const user = await User.findById(userId)
        if (!user) throw new UserInputError('Please login again to continue')
        if (user.role != 'admin')
          throw new UserInputError('Review does not belong to you')
        const r = await ShippingMethod.deleteOne({ _id: args.id })
        return r.ok == 1
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    saveShippingMethod: async (
      root,
      args,
      { req }: { req: Request }
    ): Promise<ShippingMethodDocument | null> => {
      try {
        const { userId } = req.session
        if (args.id == 'new') delete args.id
        const shippingMethod = await ShippingMethod.findOneAndUpdate(
          { _id: args.id || Types.ObjectId() },
          { $set: { ...args, user: userId } },
          { upsert: true, new: true }
        )
        return shippingMethod
      } catch (e) {
        throw new UserInputError(e)
      }
    },
  },
}

export default resolvers
