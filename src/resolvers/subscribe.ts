import { IResolvers, UserInputError } from 'apollo-server-express'
import { Request, SubscribeDocument } from '../types'
import {
  Payment,
  Setting,
  Store,
  Subscribe,
  Subscription,
  User,
} from '../models'
import { fields, index } from '../utils'
import { CASHFREE_APPID, CASHFREE_SECRET_KEY, WWW_URL } from '../config'
import { createSubscribe } from '../utils'
import { sign } from '../pay/helpers-cashfree/cashfreeSignatureUtil'

const resolvers: IResolvers = {
  Query: {
    subscribes: async (root, args, { req }: { req: Request }, info) => {
      try {
        args.populate = 'subscription user payment'
        return index({ model: Subscribe, args, info })
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    subscribe: async (
      root,
      args: { id: string },
      ctx,
      info
    ): Promise<SubscribeDocument | null> => {
      try {
        return await Subscribe.findById(args.id, fields(info)).populate(
          'subscription user payment'
        )
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    mySubscribes: async (_root, args, { req }: { req: Request }, info) => {
      try {
        const { userId } = req.session
        args.user = userId
        args.populate = 'subscription'
        const list: any = await index({ model: Subscribe, args, info })
        for (const s of list.data) {
          const g2 = new Date()
          if (
            s.EndTimeISO.getTime() > g2.getTime() &&
            s.StartTimeISO.getTime() < g2.getTime()
          ) {
            s.onGoing = true
          } else {
            s.onGoing = false
          }
        }
        return list
      } catch (err) {
        throw new UserInputError(err)
      }
    },
    isSubscribed: async (
      root,
      args,
      { req }: { req: Request }
    ): Promise<boolean> => {
      const { userId } = req.session
      let result: any
      if (args.subscriptionId) {
        result = await Subscribe.find({
          user: userId,
          subscription: args.subscriptionId,
        })
      } else {
        result = await Subscribe.find({
          user: userId,
          EndTimeISO: { $gt: new Date() },
        })
      }
      if (result.length > 0) {
        return true
      } else {
        return false
      }
    },
  },
  Mutation: {
    buySubscription: async (
      root,
      args,
      { req }: { req: Request }
    ): Promise<SubscribeDocument | null> => {
      try {
        const { userId } = req.session
        //user info
        const me: any = await User.findById(userId)
        if (!me) throw new UserInputError('User not found')
        const subscribe: SubscribeDocument = await createSubscribe(req, {
          subscriptionId: args.subscriptionId,
        })
        const settings = await Setting.findOne({})
        const customerName = me.name || settings.websiteName
        const customerPhone = me.phone || '9999999999'
        const customerEmail = me.email || 'hi@litekart.in'
        const postData: any = {
          appId: CASHFREE_APPID,
          orderId: subscribe.id,
          orderAmount: subscribe.amount,
          orderCurrency: settings.currencyCode,
          orderNote: `Payment for shopping at ${settings.websiteName}`,
          customerName,
          customerPhone,
          customerEmail,
          returnUrl: `${WWW_URL}/api/pay/capture-cashfree`,
          notifyUrl: `${WWW_URL}/api/pay/notify-cashfree`,
        }
        const derivedSignature = await sign(postData) // This is a object
        const paymentMode = 'online',
          paymentGateway = 'cashfree',
          invoiceId = subscribe._id,
          orderId = subscribe._id.toString(),
          amountPaid = 0,
          amountDue = postData.orderAmount,
          currency = postData.orderCurrency,
          signature = postData.signature
        const payment = await Payment.create({
          paymentMode,
          paymentGateway,
          invoiceId,
          orderId,
          amountPaid,
          amountDue,
          currency,
          signature,
          email: customerEmail,
          contact: customerPhone,
          customerName,
        })
        await Subscribe.findOneAndUpdate(
          { _id: subscribe._id },
          { $set: { payment: payment._id } }
        )
        return derivedSignature
      } catch (e) {
        throw new UserInputError(e)
      }
    },
  },
}

export default resolvers
