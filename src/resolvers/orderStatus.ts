import { IResolvers, UserInputError } from 'apollo-server-express'
import { Request, OrderStatusDocument } from '../types'
import { validate, objectId, couponSchema } from '../validation'
import { OrderStatus, User, Order, OrderItem } from '../models'
import { fields, index } from '../utils'
import { Types } from 'mongoose'

const resolvers: IResolvers = {
  Query: {
    orderStatus: async (root, args, { req }: { req: Request }, info) => {
      const { userId } = req.session
      try {
        const user = await User.findById(userId)
        if (!user) args.active = true
        if (user && user.role != 'admin') args.active = true
        return OrderStatus.findById(args.id, fields(info))
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    orderStatusOfOrder: async (
      root,
      args,
      ctx,
      info
    ): Promise<OrderStatusDocument | null> => {
      try {
        // @ts-ignore
        return OrderStatus.find({ order: args.order_id }, fields(info))
      } catch (e) {
        throw new UserInputError(e)
      }
    },
  },
  Mutation: {
    removeOrderStatus: async (
      root,
      args,
      { req }: { req: Request }
    ): Promise<boolean> => {
      const { userId } = req.session
      try {
        const user = await User.findById(userId)
        if (!user) throw new UserInputError('Please login again to continue')
        const orderStatus: any = await OrderStatus.findByIdAndDelete({
          _id: args.id,
        })
        if (orderStatus) {
          const order = await Order.findOneAndUpdate(
            { _id: orderStatus.order, 'items.pid': orderStatus.item },
            {
              // @ts-ignore
              $pull: { 'items.$.orderStatus': orderStatus.id },
            },
            { new: true }
          )
          return true
        } else {
          return false
        }
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    saveOrderStatus: async (
      root,
      args,
      { req }: { req: Request }
    ): Promise<OrderStatusDocument | null> => {
      if (args.id == 'new') delete args.id
      const { userId } = req.session
      try {
        const orderStatus = await OrderStatus.findOneAndUpdate(
          { _id: args.id || Types.ObjectId() },
          { $set: { ...args, user: userId } },
          { upsert: true, new: true }
        )
        // console.log('the updated orderStatus is:', orderStatus)
        await orderStatus.save() // To fire pre save hoook
        //add orderstatus in order model in items field
        const order = await Order.findOneAndUpdate(
          { _id: args.order, 'items.pid': args.item },
          {
            $addToSet: { 'items.$.orderStatus': orderStatus._id },
            $set: {
              'items.$.status': args.event,
            },
          },
          { new: true }
        ).populate('orderItems')
        //add orderStatus in orderItem model
        const orderItems = order.orderItems
        for (const orderItem of orderItems) {
          if (orderItem.pid == args.item) {
            await OrderItem.findByIdAndUpdate(orderItem._id, {
              //@ts-ignore
              $addToSet: { orderStatus: orderStatus._id },
              $set: { status: args.event },
            })
          }
        }

        // console.log('order after update status is', orderStatus._id, order.items)
        return orderStatus
      } catch (e) {
        throw new UserInputError(e)
      }
    },
  },
}

export default resolvers
