import { Types } from 'mongoose'
import { IResolvers, UserInputError, withFilter } from 'apollo-server-express'
import { Request, SettingsDocument } from '../types'
import { objectId, ifImage } from '../validation'
import { Setting } from '../models'
import { fields, hasSubfields } from '../utils'
import pubsub from '../pubsub'
import {
  closed,
  worldCurrencies,
  paymentMethods,
  sorts,
  timesList,
  returnReasons,
  orderStatuses,
  userRoles,
  paymentStatuses,
  WWW_URL,
  ADMIN_PANEL_LINK,
  S3_BUCKET_NAME,
  S3_REGION,
  GOOGLE_CLIENT_ID,
} from './../config'

const SETTINGS_UPDATED = 'SETTINGS_UPDATED'
const resolvers: IResolvers = {
  Query: {
    shutter: (root, args, { req }: { req: Request }, info) => {
      try {
        const start = closed.from.hour * 60 + closed.from.minute
        const end = closed.to.hour * 60 + closed.to.minute
        const date = new Date()
        const now = date.getHours() * 60 + date.getMinutes()
        if (start <= now && now <= end) throw new UserInputError(closed.message)
        else return true
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    worldCurrencies: (root, args, { req }: { req: Request }, info) => {
      return worldCurrencies
    },
    returnReasons: (root, args, { req }: { req: Request }, info) => {
      return returnReasons
    },
    orderStatuses: (root, args, { req }: { req: Request }, info) => {
      return orderStatuses.filter((o) => o.public)
    },
    paymentStatuses: (root, args, { req }: { req: Request }, info) => {
      return paymentStatuses
    },
    sorts: (root, args, { req }: { req: Request }, info) => {
      return sorts
    },
    timesList: (root, args, { req }: { req: Request }, info) => {
      return timesList
    },
    userRoles: (root, args, { req }: { req: Request }, info) => {
      return userRoles
    },
    settings: async (root, args, { req }: { req: Request }, info) => {
      try {
        const s: any = await Setting.findOne({}, fields(info)).exec()
        s.userRoles = userRoles
        s.returnReasons = returnReasons
        s.paymentStatuses = paymentStatuses
        s.orderStatuses = orderStatuses
        s.worldCurrencies = worldCurrencies
        s.paymentMethods = paymentMethods
        s.WWW_URL = WWW_URL
        s.ADMIN_PANEL_LINK = ADMIN_PANEL_LINK
        s.GOOGLE_CLIENT_ID = GOOGLE_CLIENT_ID
        if (S3_REGION && S3_BUCKET_NAME)
          s.S3_URL = `https://${S3_BUCKET_NAME}.s3.${S3_REGION}.amazonaws.com/`
        return s
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    settingsAdmin: (root, args, { req }: { req: Request }, info) => {
      // args.uid = req.session.userId
      try {
        const s: any = Setting.find({}, fields(info)).exec()
        s.WWW_URL = WWW_URL
        return s
      } catch (e) {
        throw new UserInputError(e)
      }
    },
  },

  Mutation: {
    saveSettings: async (
      root,
      args,
      { req }: { req: Request }
    ): Promise<SettingsDocument> => {
      const { userId } = req.session
      const { id } = args
      try {
        const settings = await Setting.findByIdAndUpdate(
          id,
          { $set: { ...args, uid: userId } },
          { new: true }
        ) // If pre hook to be executed for product.save()
        if (!settings)
          throw new UserInputError(`Settings with id= ${id} not found`)

        pubsub.publish(SETTINGS_UPDATED, { settingsUpdated: settings })

        await settings.save() // To fire pre save hoook

        return settings
      } catch (e) {
        throw new UserInputError(e)
      }
    },
  },

  Subscription: {
    settingsUpdated: {
      resolve: (
        { settingsUpdated }: { settingsUpdated: SettingsDocument },
        args,
        ctx,
        info
      ) => {
        return settingsUpdated
      },
      subscribe: withFilter(
        () => pubsub.asyncIterator(SETTINGS_UPDATED),
        async (__, _, { req }: { req: Request }) => {
          return true
        }
      ),
    },
  },
}

export default resolvers
