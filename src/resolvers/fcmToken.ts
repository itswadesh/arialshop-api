import {
  IResolvers,
  UserInputError,
  AuthenticationError,
} from 'apollo-server-express'
import { FcmTokenDocument, Request, Response, UserDocument } from '../types'
import { User, FcmToken, Slug, Setting } from '../models'
import { fields, index } from '../utils'
import { sendMail } from '../utils/email'
import { FIREBASE_REGISTRATION_TOKEN } from '../config'
import { nanoid } from 'nanoid'
import { Types } from 'mongoose'
import { difference } from 'lodash'

import * as admin from 'firebase-admin'
// import { Response } from 'apollo-env'
// var serviceAccount = require('./../../firebase-adminsdk.json')
import { machineId, machineIdSync } from 'node-machine-id'

const resolvers: IResolvers = {
  Query: {
    tokens: (root, args, { req }: { req: Request }, info) => {
      args.populate = 'user'
      try {
        return index({ model: FcmToken, args, info })
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    myTokens: async (root, args, { req }: { req: Request }, info) => {
      const { userId } = req.session
      try {
        const user = await User.findById(userId)
        if (!user) args.active = true
        args.populate = 'user'
        if (user && user.role != 'admin' && user.role !== 'super')
          args.active = true
        return index({ model: FcmToken, args, info })
      } catch (e) {
        throw new UserInputError(e)
      }
    },
  },

  Mutation: {
    deleteFcmToken: async (
      root,
      args,
      { req }: { req: Request }
    ): Promise<boolean> => {
      try {
        const fcmToken: any = await FcmToken.findByIdAndDelete(args.id)
        if (fcmToken) {
          return true
        } else {
          return false
        }
      } catch (e) {
        throw new UserInputError(e)
      }
    },

    saveFcmToken: async (
      root,
      args,
      { req }: { req: Request },
      info
    ): Promise<FcmTokenDocument> => {
      const { userId } = req.session
      try {
        if (!args.device_id) args.device_id = await machineId()
        args.sId = req.session.id
        req.session.user_type = 'guest'

        if (!userId) {
          args.user_type = 'guest'
        } else {
          args.user = userId
          args.user_type = 'authorized'
        }

        if (args.id == 'new') {
          delete args.id
        }
        const fcmToken = await FcmToken.findOneAndUpdate(
          { _id: args.id || Types.ObjectId() },
          { $set: { ...args } },
          { upsert: true, new: true }
        ).populate('user')

        // console.log('the updated fcmToken is:', fcmToken)
        return fcmToken
      } catch (e) {
        throw new UserInputError(e)
      }
    },

    notifyFirebase: async (
      root,
      args,
      { req }: { req: Request },
      info
    ): Promise<boolean> => {
      try {
        const registrationToken = FIREBASE_REGISTRATION_TOKEN

        // admin.initializeApp({
        //   credential: admin.credential.cert(serviceAccount),
        //   databaseURL: DATABASE_URL,
        // })

        const payload = {
          notification: {
            title: 'This is a Notification Message from node',
            body: 'This is the body of the notification message .',
          },
        }

        const options = {
          priority: 'high',
          timeToLive: 60 * 60 * 24,
        }
        // Send a message to devices subscribed to the provided topic.
        admin
          .messaging()
          .sendToDevice(registrationToken, payload, options)
          .then(function (response) {
            console.log(
              'Successfully sent message:',
              response,
              registrationToken
              // response.results[0].error
            )
          })
          .catch(function (error) {
            console.log('Error sending message:', error)
          })

        // var topic = 'general'
        // var message = {
        //   notification: {
        //     title: 'Message from node',
        //     body: 'hey there',
        //   },
        //   topic: topic,
        // }
        // // Send a message to devices subscribed to the provided topic.
        // admin
        //   .messaging()
        //   .send(message)
        //   .then((response) => {
        //     // Response is a message ID string.
        //     console.log('Successfully sent message:', response)
        //   })
        //   .catch((error) => {
        //     console.log('Error sending message:', error)
        //   })
        return true
      } catch (e) {
        throw new UserInputError(e)
      }
    },
  },
}

export default resolvers
