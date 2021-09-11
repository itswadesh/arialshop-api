import { IResolvers, UserInputError, withFilter } from 'apollo-server-express'
import { Request, InstantMessageDocument } from '../types'
import { validate, objectId } from '../validation'
import { User, InstantMessage } from '../models'
import { fields, hasSubfields, index } from '../utils'
import { Types } from 'mongoose'
import pubsub from '../pubsub'

const MESSAGE_RECEIVED = 'MESSAGE_RECEIVED'

const resolvers: IResolvers = {
  Query: {
    channelMessages: async (root, args, { req }: { req: Request }, info) => {
      try {
        args.sort = '-createdAt'
        return index({ model: InstantMessage, args, info })
      } catch (e) {
        throw new UserInputError(e)
      }
    },
  },
  Mutation: {
    sendInstantMessage: async (
      root,
      args,
      { req }: { req: Request }
    ): Promise<InstantMessageDocument | null> => {
      const { userId } = req.session
      const user = await User.findById(userId)
      if (!user) throw new UserInputError('user not found')
      try {
        args.user = userId
        args.uid = userId
        args.firstName = user.firstName
        args.lastName = user.lastName
        const im = await InstantMessage.create(args)

        pubsub.publish(MESSAGE_RECEIVED, { messageReceived: im })

        return im
      } catch (e) {
        throw new UserInputError(e)
      }
    },
  },
  Subscription: {
    messageReceived: {
      resolve: (
        { messageReceived }: { messageReceived: InstantMessageDocument },
        args,
        ctx,
        info
      ) => {
        return messageReceived
      },
      subscribe: withFilter(
        () => pubsub.asyncIterator(MESSAGE_RECEIVED),
        async (__, _, { req }: { req: Request }) => {
          return true
        }
      ),
    },
    chats: {
      resolve: (root, args, ctx, info) => {
        // return messageReceived
        args.sort = '-createdAt'
        return index({ model: InstantMessage, args, info })
      },
      subscribe: withFilter(
        () => pubsub.asyncIterator(MESSAGE_RECEIVED),
        async (__, _, { req }: { req: Request }) => {
          return true
        }
      ),
    },
  },
  // messageReceived: {
  //   resolve: ({ messageReceived }: any, args, ctx, info) => {
  //     messageReceived.id = messageReceived._id
  //     return messageReceived
  //     // try {
  //     //   return index({ model: InstantMessage, args, info })
  //     // } catch (e) {
  //     //   throw new UserInputError(e)
  //     // }
  //   },
  // },
  // },
}

export default resolvers
