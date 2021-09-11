import { IResolvers, UserInputError } from 'apollo-server-express'
import { Request, SubscriptionDocument } from '../types'
import { Subscription, User } from '../models'
import { fields, index } from '../utils'
import { Types } from 'mongoose'

const resolvers: IResolvers = {
  Query: {
    subscriptions: async (root, args, { req }: { req: Request }, info) => {
      const { userId } = req.session
      try {
        const user = await User.findById(userId)
        if (!user) args.active = true
        if (user && user.role != 'admin' && user.role !== 'super')
          args.active = true
        return index({ model: Subscription, args, info })
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    subscription: async (
      root,
      args: { id: string },
      ctx,
      info
    ): Promise<SubscriptionDocument | null> => {
      try {
        return Subscription.findById(args.id, fields(info))
      } catch (e) {
        throw new UserInputError(e)
      }
    },
  },
  Mutation: {
    deleteSubscription: async (
      root,
      args,
      { req }: { req: Request }
    ): Promise<boolean | null> => {
      const { userId } = req.session
      try {
        const subscription = await Subscription.findById(args.id)
        if (!subscription) throw new UserInputError('Subscription not found')
        const user = await User.findById(userId)
        if (!user) throw new UserInputError('Please login again to continue')
        const s = await Subscription.deleteOne({ _id: args.id })
        return s.ok == 1
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    saveSubscription: async (
      root,
      args,
      { req }: { req: Request }
    ): Promise<SubscriptionDocument | null> => {
      try {
        const { userId } = req.session
        if (args.id == 'new') {
          const subscription = await Subscription.findOne({
            name: args.name,
          }).collation({
            locale: 'tr',
            strength: 1,
          })
          if (subscription)
            throw new Error(
              'subscription already existed,can not create new subscription with same name'
            )
          delete args.id
        }
        const subscription = await Subscription.findOneAndUpdate(
          { _id: args.id || Types.ObjectId() },
          { $set: { ...args, user: userId } },
          { upsert: true, new: true }
        )
        // console.log('the updated subscription is:', subscription)
        return subscription
      } catch (e) {
        throw new UserInputError(e)
      }
    },
  },
}

export default resolvers
