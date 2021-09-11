import { Types } from 'mongoose'
import dayjs from 'dayjs'
import {
  IResolvers,
  UserInputError,
  ForbiddenError,
  withFilter,
} from 'apollo-server-express'
import { Request, OrderDocument, OrderItemDocument } from '../types'
import { validate, objectId, orderSchema } from '../validation'
import {
  Address,
  Order,
  OrderItem,
  OrderStatus,
  Payment,
  Product,
  Setting,
  Store,
  User,
} from '../models'
import {
  fields,
  hasSubfields,
  index,
  indexSub,
  getStartEndDate,
  placeOrder,
  clearCart,
  validateCart,
  validateCoupon,
  calculateSummary,
  placeOrderViaAdmin,
  confirmOrder,
  returnCompleteOrder,
  orderShippingAndUpdate,
  toJson,
  insertServiceBusQueue,
  generateInvoice,
  returnOrReplaceServiceBusHook,
} from '../utils'
import { ObjectId } from 'mongodb'
import pubsub from '../pubsub'
import user from '../typeDefs/user'
import { orderStatuses, ORDER_RETURN_QUEUE_NAME } from '../config'

const ORDER_UPDATED = 'ORDER_UPDATED'

const resolvers: IResolvers = {
  Query: {
    validateCoupon: async (root, args, { req }) => {
      const { cart } = req.session
      try {
        const code = req.session.cart.discount && req.session.cart.discount.code
        await calculateSummary(req, code)
      } catch (e) {
        throw new UserInputError(e)
      }
      // await validateCoupon(cart, code)
    },
    validateCart: async (root, args, { req }) => {
      try {
        await validateCart(req)
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    //IT returns that user ordered this item or not
    hasOrder: async (root, args, { req }: { req: Request }, info) => {
      const { userId } = req.session
      try {
        const order = await Order.findOne({
          user: userId,
          'items.pid': args.product,
        })
        if (!order) return false
        const p = order.items.find((element) => element.pid == args.product)
        return p && !p.reviewed
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    byVendor: async (root, args, { req }: { req: Request }, info) => {
      try {
        const { userId } = req.session
        //checking store
        const setting = await Setting.findOne()
        if (!setting) throw new Error('Something went wrong')
        if (setting.isMultiStore) {
          const user = await User.findById(userId)
          if (!user.store) throw new Error('You have not own a store')
          const store = await Store.findById(user.store)
          if (!store) throw new Error('Your store does not exist')
          args.store = Types.ObjectId(store._id)
        }

        const pageSize = setting.pageSize || 10
        const page = !args.page && args.page != 0 ? 1 : parseInt(args.page)
        const data: any = await Order.aggregate([
          {
            $match: {
              'items.status': {
                $nin: ['Delivered', 'Payment Pending', 'NIS', 'Cancelled'],
              },
            },
          },
          { $unwind: '$items' },
          { $match: args },
          // { $project: { orderNo: 1, createdAt: 1, updatedAt:1, items: 1, address: 1, s: { $sum: "$items.price" } } },
          {
            $group: {
              _id: {
                vendor: '$items.vendor',
              },
              items: { $addToSet: '$items' },
              total: { $sum: '$items.price' },
              count: { $sum: '$items.qty' },
              date: { $max: '$createdAt' },
            },
          },
          { $sort: { _id: -1 } },
        ])

        const count: any = await Order.countDocuments({
          status: {
            $nin: ['Delivered', 'Payment Pending', 'NIS', 'Cancelled'],
          },
        })
        return { data, count, pageSize, page }
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    //This will return all the orders of mine (like my orders)
    orders: async (root, args, { req }: { req: Request }, info) => {
      const { userId } = req.session
      // console.log(args)
      try {
        const user = await User.findById(userId)
        if (!user) throw new UserInputError('You are not authorized')
        if (user.role != 'admin' && user.role != 'super')
          args['vendor'] = userId
        if (args.phone) {
          args['userPhone'] = args.phone
        }
        if (args.vendor) {
          args['vendor'] = args.vendor
          delete args.vendor
        }
        // if (args.user) args['user'] = args.user
        const { start, end } = getStartEndDate(0)
        if (args.today) args.createdAt = { $gte: start, $lte: end }
        const where = toJson(args.where) || args || {}
        if (where.status) {
          let statusArray = orderStatuses.map((s) => s.status)
          const pendingStatusArray = ['Ordered', 'Confirmed', 'Packed']
          const trackingStatusArray = [
            'Shipped',
            'Out for delivery',
            'Return',
            'Pickup',
            'Refund',
          ]
          const closedStatusArray = ['NIS', 'Cancelled', 'Delivered', 'Closed']

          if (where.status == 'Pending') {
            where['status'] = {
              $in: pendingStatusArray,
            }
          } else if (where.status == 'Tracking') {
            where['status'] = {
              $in: trackingStatusArray,
            }
          } else if (where.status == 'Closed') {
            where['status'] = {
              $in: closedStatusArray,
            }
          }
          delete where.status
        }
        args.where = JSON.stringify(where)
        args.populate = 'user vendor store payment'
        // console.log('before pass', args)
        //checking store
        const settings = await Setting.findOne()
        if (!settings) throw new Error('Something went wrong')
        let isMultiStore = false
        if (settings.isMultiStore) isMultiStore = true

        return index({ model: OrderItem, args, info, isMultiStore })
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    //this will return array of all the orders placed on the website
    allOrders: async (root, args, { req }: { req: Request }, info) => {
      const { userId } = req.session
      try {
        const user = await User.findById(userId)
        if (!user) throw new UserInputError('You are not authorized')
        if (user.role != 'admin' && user.role != 'super')
          args['items.vendor'] = userId
        if (args.phone) {
          args['userPhone'] = args.phone
        }
        if (args.vendor) {
          args['items.vendor.id'] = args.vendor
          delete args.vendor
        }

        // if (args.user) args['user'] = args.user
        const { start, end } = getStartEndDate(0)
        if (args.today) args.createdAt = { $gte: start, $lte: end }
        const where = toJson(args.where) || args || {}
        if (where.status) {
          let statusArray = orderStatuses.map((s) => s.status)
          const pendingStatusArray = ['Ordered', 'Confirmed', 'Packed']
          const trackingStatusArray = [
            'Shipped',
            'Out for delivery',
            'Return',
            'Pickup',
            'Refund',
          ]
          const closedStatusArray = ['NIS', 'Cancelled', 'Delivered', 'Closed']

          if (where.status == 'Pending') {
            where['items.status'] = {
              $in: pendingStatusArray,
            }
          } else if (where.status == 'Tracking') {
            where['items.status'] = {
              $in: trackingStatusArray,
            }
          } else if (where.status == 'Closed') {
            where['items.status'] = {
              $in: closedStatusArray,
            }
          }
          delete where.status
        }
        args.where = JSON.stringify(where)
        args.populate = 'user items.vendor items.orderStatus store payment'
        //checking store
        const settings = await Setting.findOne()
        if (!settings) throw new Error('Something went wrong')
        let isMultiStore = false
        if (settings.isMultiStore) isMultiStore = true

        return index({ model: Order, args, info, isMultiStore })
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    //We can fetch signle order by passing orderId
    order: async (
      root,
      args: { id: string },
      ctx,
      info
    ): Promise<OrderDocument | null> => {
      try {
        await objectId.validateAsync(args)
        return Order.findById(args.id, fields(info)).populate({
          path: 'items addressId orderItems store payment',
          populate: {
            path: 'orderStatus vendor refunds',
          },
        })
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    myOrders: async (root, args, { req }: { req: Request }, info) => {
      // let statusArray = [
      //   // = Pending
      //   // 'Payment Pending',
      //   'Ordered',
      // ]
      // if (args.status == 'Tracking') {
      //   statusArray = ['Ordered', 'Packed', 'Out for delivery']
      // } else if (args.status == 'Delivered') {
      //   statusArray = ['Delivered']
      // }
      // args['items.status'] = {
      //   $in: statusArray,
      // }
      const { userId } = req.session
      args['user'] = userId
      args.paySuccess = { $gt: 0 }
      delete args.status
      // console.log('zzzzzzzzzzzzzzzzzz', args)
      args.populate = {
        path: 'user items.vendor items.orderStatus orderItems store payment',
        populate: { path: 'orderStatus' },
        // options: { sort: { position: 1 } },
      }
      try {
        //checking store
        const settings = await Setting.findOne()
        if (!settings) throw new Error('Something went wrong')
        let isMultiStore = false
        if (settings.isMultiStore) isMultiStore = true

        return index({ model: Order, args, info, isMultiStore })
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    myOrderItems: async (root, args, { req }: { req: Request }, info) => {
      // let statusArray = [
      //   // = Pending
      //   // 'Payment Pending',
      //   'Ordered',
      // ]
      // if (args.status == 'Tracking') {
      //   statusArray = ['Ordered', 'Packed', 'Out for delivery']
      // } else if (args.status == 'Delivered') {
      //   statusArray = ['Delivered']
      // }
      // args['items.status'] = {
      //   $in: statusArray,
      // }
      const { userId } = req.session
      args['user'] = userId
      args.paySuccess = { $gt: 0 }
      delete args.status
      args.populate = 'user vendor store refunds payment'
      try {
        // console.log('zzzzzzzzzzzzzzzzzz',args);
        //checking store
        const settings = await Setting.findOne()
        if (!settings) throw new Error('Something went wrong')
        let isMultiStore = false
        if (settings.isMultiStore) isMultiStore = true

        return index({ model: OrderItem, args, info, isMultiStore })
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    ordersByStatus: (root, args, { req }: { req: Request }, info) => {
      // let userId = Types.ObjectId(args.id)
      args['items.status'] = args.status
      delete args.status
      try {
        return indexSub({ model: Order, args, info })
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    ordersForPickup: async (root, args, { req }: { req: Request }, info) => {
      try {
        const vendor = Types.ObjectId(args.vendor)
        args['items.vendor.id'] = vendor
        args['items.status'] = args.status
        delete args.vendor
        delete args.status
        return indexSub({ model: Order, args, info })
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    myCustomers: async (root, args, { req }: { req: Request }, info) => {
      let { userId } = req.session
      try {
        userId = Types.ObjectId(userId)
        args['items.vendor.id'] = userId
        return indexSub({ model: Order, args, info, userId })
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    vendorOrders: async (root, args, { req }: { req: Request }, info) => {
      try {
        const vendor = Types.ObjectId(args.vendor)
        args['items.vendor'] = vendor
        args['items.status'] = args.status
        delete args.vendor
        delete args.status
        args.populate = {
          path: 'items items.vendor',
          populate: {
            path: 'orderStatus',
          },
        }
        return index({ model: Order, args, info })
      } catch (e) {
        throw new UserInputError(e)
      }
    },

    paymentsSummary: async (root, args, { req }: { req: Request }, info) => {
      try {
        const { userId } = req.session
        const user = await User.findById(userId)
        if (!user) throw new Error('Please login')
        //checking store
        const setting = await Setting.findOne()
        if (!setting) throw new Error('Something went wrong')
        if (setting.isMultiStore) {
          if (!user.store) throw new Error('You have not own a store')
          const store = await Store.findById(user.store)
          if (!store) throw new Error('Your store does not exist')
          args.store = Types.ObjectId(store._id)
        }
        const data = await Order.aggregate([
          { $match: args },
          {
            $group: {
              _id: null,
              amount: { $sum: '$amount.total' },
              count: { $sum: 1 },
              codPaid: { $sum: '$codPaid' },
            },
          },
        ])
        return data[0]
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    orderSummary: async (root, args, { req }: { req: Request }, info) => {
      try {
        const { userId } = req.session
        const user = await User.findById(userId)
        if (!user) throw new Error('Please login')
        //checking store
        const setting = await Setting.findOne()
        if (!setting) throw new Error('Something went wrong')
        if (setting.isMultiStore) {
          if (!user.store) throw new Error('You have not own a store')
          const store = await Store.findById(user.store)
          if (!store) throw new Error('Your store does not exist')
          args.store = Types.ObjectId(store._id)
        }
        const data = await Order.aggregate([
          { $unwind: '$items' },
          { $match: args },
          {
            $group: {
              _id: null,
              amount: { $sum: '$items.price' },
              count: { $sum: 1 },
              createdAt: { $max: '$createdAt' },
            },
          },
        ])
        return data[0]
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    statusSummary: async (root, args, { req }: { req: Request }, info) => {
      const { userId } = req.session
      try {
        //checking store
        const setting = await Setting.findOne()
        if (!setting) throw new Error('Something went wrong')
        if (setting.isMultiStore) {
          const user = await User.findById(userId)
          if (!user.store) throw new Error('You have not own a store')
          const store = await Store.findById(user.store)
          if (!store) throw new Error('Your store does not exist')
          args.store = Types.ObjectId(store._id)
        }
        const data = await Order.aggregate([
          { $unwind: '$items' },
          { $match: args },
          {
            $group: {
              _id: '$items.status',
              amount: { $sum: '$items.price' },
              count: { $sum: 1 },
              createdAt: { $max: '$createdAt' },
            },
          },
          { $sort: { _id: 1 } },
        ])
        return data
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    // For vendor dashboard
    vendorSummary: async (root, args, { req }: { req: Request }, info) => {
      const { userId } = req.session
      try {
        //checking store
        const setting = await Setting.findOne()
        if (!setting) throw new Error('Something went wrong')
        if (setting.isMultiStore) {
          const user = await User.findById(userId)
          if (!user.store) throw new Error('You have not own a store')
          const store = await Store.findById(user.store)
          if (!store) throw new Error('Your store does not exist')
          args.store = Types.ObjectId(store._id)
        }
        const data = await Order.aggregate([
          {
            $match: { 'items.vendor': Types.ObjectId(userId) },
          },
          { $unwind: '$items' },
          { $match: args },
          {
            $group: {
              _id: '$items.status',
              amount: { $sum: '$items.price' },
              count: { $sum: 1 },
              createdAt: { $max: '$createdAt' },
            },
          },
        ])
        return data
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    dailySales: async (root, args, { req }: { req: Request }, info) => {
      const { userId } = req.session
      try {
        //checking store
        const setting = await Setting.findOne()
        if (!setting) throw new Error('Something went wrong')
        if (setting.isMultiStore) {
          const user = await User.findById(userId)
          if (!user.store) throw new Error('You have not own a store')
          const store = await Store.findById(user.store)
          if (!store) throw new Error('Your store does not exist')
          args.store = Types.ObjectId(store._id)
        }
        const data: any = await Order.aggregate([
          { $match: args },
          {
            $group: {
              _id: {
                $dateToString: { format: '%Y-%m-%d', date: '$updatedAt' },
              },
              total: { $sum: '$amount.total' },
              qty: { $sum: '$amount.qty' },
            },
          },
          { $sort: { _id: 1 } },
        ]).exec()
        // console.log('daily Sales data is:', data)
        return data
      } catch (err) {
        console.log(err)
      }
    },
    paymentMethodSummary: async (
      root,
      args,
      { req }: { req: Request },
      info
    ) => {
      try {
        let data
        if (args.vendor) {
          data = await Order.aggregate([
            { $match: { 'items.vendor': Types.ObjectId(args.vendor) } },
            {
              $group: {
                _id: '$paymentMode',
                amount: { $sum: '$amount.total' },
                count: { $sum: '$amount.qty' },
              },
            },
          ])
        } else {
          data = await Order.aggregate([
            {
              $group: {
                _id: '$paymentMode',
                amount: { $sum: '$amount.total' },
                count: { $sum: '$amount.qty' },
              },
            },
          ])
        }
        return data
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    orderItem: async (
      root,
      args: { id: string },
      ctx,
      info
    ): Promise<OrderItemDocument | null> => {
      try {
        return OrderItem.findById(args.id, fields(info)).populate(
          'orderStatus vendor user store refunds payment'
        )
      } catch (e) {
        throw new UserInputError(e)
      }
    },
  },
  Mutation: {
    updateOrder: async (
      root,
      args: {
        id: string
        pid: string
        status: string
        tracking: string
        storeId: string
        trackingId: string
        courierName: string
        returnTrackingId: string
        returnCourierName: string
      },
      { req }: { req: Request }
    ): Promise<OrderDocument | null> => {
      const { userId } = req.session
      try {
        const order = await Order.findOneAndUpdate(
          { _id: args.id, 'items.pid': args.pid },
          {
            $set: {
              'items.$.status': args.status,
              'items.$.tracking': args.tracking,
              'items.$.storeId': args.storeId,
            },
          },
          { new: true }
        )
        if (!order) throw new Error('invalid order id')
        // for item status update
        for (let item of order.items) {
          if (item.pid == args.pid) {
            for (let oh of item.orderHistory) {
              if (oh.status.toLowerCase() == args.status.toLowerCase()) {
                oh.time = dayjs()
              }
              if (args.status.toLowerCase() == 'delivered') {
                const product = await Product.findById(item.pid).select(
                  'returnValidityInDays'
                )
                if (!product) throw new Error('product not found')
                // item.returnValidTill = dayjs().add(
                //   product.returnValidityInDays,
                //   'days'
                // )
              }
            }
          }
        }
        await order.save()
        //for orderItems update
        for (let oi of order.orderItems) {
          let orderItem = await OrderItem.findById(oi._id)
          if (orderItem) {
            if (orderItem.pid == args.pid) {
              for (let oh of orderItem.orderHistory) {
                if (oh.status.toLowerCase() == args.status.toLowerCase()) {
                  oh.time = dayjs()
                }
                if (args.status.toLowerCase() == 'delivered') {
                  const product = await Product.findById(args.pid).select(
                    'returnValidityInDays'
                  )
                  if (!product) throw new Error('product not found')
                  // orderItem.returnValidTill = dayjs().add(
                  //   product.returnValidityInDays,
                  //   'days'
                  // )
                }
              }
              if (args.trackingId) orderItem.trackingId = args.trackingId
              if (args.returnTrackingId)
                orderItem.returnTrackingId = args.returnTrackingId
              if (args.courierName) orderItem.courierName = args.courierName
              if (args.returnCourierName)
                orderItem.returnCourierName = args.returnCourierName
              if (args.status) orderItem.status = args.status
              if (args.tracking) orderItem.tracking = args.tracking
            }
          }
          await orderItem.save()
        }
        // let orderItem =  await OrderItem.findById()
        if (!order) throw new UserInputError('Order not found.')
        pubsub.publish(ORDER_UPDATED, { orderUpdated: order })
        // sendMail({
        //   to: me.email,
        //   subject: SHOP_NAME + ' Order Updated Successfully',
        //   template: 'order/updated',
        //   context: {
        //     orderNo: o.orderNo,
        //     createdAt: o.createdAt,
        //     items: o.items,
        //     amount: o.amount,
        //     address: o.address,
        //   },
        // })
        if (args.status) {
          if (args.status.toLowerCase() == 'confirmed') {
            await orderShippingAndUpdate(order, args.pid)
          }
          if (args.status.toLowerCase() == 'return complete') {
            await returnCompleteOrder(order, args.pid)
          }
        }

        return order
      } catch (e) {
        throw new UserInputError(e)
      }
    },

    updateOrderItem: async (
      root,
      args: {
        id: string
        pid: string // Not required
        status: string
        tracking: string
        storeId: string
        trackingId: string
        courierName: string
        returnTrackingId: string
        returnCourierName: string
      },
      { req }: { req: Request }
    ): Promise<OrderItemDocument | null> => {
      const { userId } = req.session
      try {
        let orderItem = await OrderItem.findById(args.id)
        if (!orderItem) throw new UserInputError('Order not found.')
        let forUpdate: any = orderItem
        //for orderItems update
        for (let oh of forUpdate.orderHistory) {
          if (oh.status.toLowerCase() == args.status.toLowerCase()) {
            oh.time = dayjs()
          }
          if (args.status.toLowerCase() == 'delivered') {
            const product = await Product.findById(forUpdate.pid).select(
              'returnValidityInDays'
            )
            if (!product) throw new Error('product not found')
            // forUpdate.returnValidTill = dayjs().add(
            //   product.returnValidityInDays,
            //   'days'
            // )
          }
        }
        if (args.trackingId) forUpdate.trackingId = args.trackingId
        if (args.returnTrackingId)
          forUpdate.returnTrackingId = args.returnTrackingId
        if (args.courierName) forUpdate.courierName = args.courierName
        if (args.returnCourierName)
          forUpdate.returnCourierName = args.returnCourierName
        if (args.status) forUpdate.status = args.status
        if (args.tracking) forUpdate.tracking = args.tracking
        if (args.storeId) forUpdate.storeId = args.storeId

        const updatedOrderItem = await OrderItem.findByIdAndUpdate(
          args.id,
          { $set: { ...forUpdate } },
          { new: true }
        )
        // let orderItem =  await OrderItem.findById()
        // pubsub.publish(ORDER_UPDATED, { orderUpdated: order })
        // sendMail({
        //   to: me.email,
        //   subject: SHOP_NAME + ' Order Updated Successfully',
        //   template: 'order/updated',
        //   context: {
        //     orderNo: o.orderNo,
        //     createdAt: o.createdAt,
        //     items: o.items,
        //     amount: o.amount,
        //     address: o.address,
        //   },
        // })
        // if (args.status == 'order creation') await createOrderOnShipRocket()
        return updatedOrderItem
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    collectPayment: async (
      root,
      args: { id: string; codPaid: number },
      { req }: { req: Request }
    ): Promise<boolean> => {
      const { userId } = req.session
      try {
        const o = await Order.updateOne(
          { _id: args.id },
          {
            $set: {
              paymentAmount: args.codPaid,
              codPaid: args.codPaid,
            },
          }
        )
        return o.nModified == 1
      } catch (e) {
        throw new UserInputError(e)
      }
    },

    checkout: async (root, args, { req }) => {
      try {
        // await checkout.validateAsync(args, { abortEarly: false })
        //PLACE-ORDER  will validate-cart and calculate-summmry and collect all oredrDeatails
        const { userId } = req.session
        const me: any = await User.findById(userId)
        if (!me) throw new UserInputError('User not found')
        const newOrder: any = await placeOrder(req, { address: args.address })
        const amount = Math.round(newOrder.amount.total)
        //setting check
        const settings = await Setting.findOne({})
        const customerName =
          newOrder.address.userFirstName ||
          newOrder.userFirstName ||
          settings.websiteName
        const customerPhone =
          newOrder.address.phone || newOrder.userPhone || '9999999999'
        const customerEmail =
          newOrder.address.email || newOrder.userEmail || 'hi@litekart.in'
        // setup payment data
        const paymentOrderId = null,
          paymentReceipt = newOrder.cartId.toString(),
          paymentNotes = { phone: newOrder.user.phone, purpose: '' },
          amountPaid = 0,
          invoiceId = newOrder._id,
          receipt = newOrder.cartId.toString(),
          orderId = newOrder._id.toString(),
          paymentMode = 'COD',
          paid = false,
          paymentStatus = 'created',
          amountDue = amount,
          currency = settings.currencyCode
        let store
        if (newOrder.store) store = newOrder.store

        // captured = true, // This is only to identify COD and online PAID cases in order history

        //check that item is free or not
        if (amount > 0) {
          // console.log('amount payable: ', amount) //order update
          const payment = await Payment.create({
            paymentMode,
            invoiceId,
            receipt,
            orderId,
            amountPaid,
            amountDue,
            currency,
            status: 'pending',
            email: customerEmail,
            contact: customerPhone,
            customerName,
            store,
          })
          //order update
          await Order.findByIdAndUpdate(newOrder._id, {
            $set: {
              paymentOrderId,
              paymentReceipt,
              paymentNotes,
              amountPaid,
              amountDue,
              invoiceId,
              paymentMode,
              paid,
              paymentStatus,
              status: 'Ordered',
              payment: payment._id,
            },
          })
          //for orderitem update
          await OrderItem.updateMany(
            { orderId: newOrder._id },
            {
              $set: {
                paymentOrderId,
                paymentReceipt,
                paymentNotes,
                amountPaid,
                amountDue,
                invoiceId,
                paymentMode,
                paid,
                paymentStatus,
                status: 'Ordered',
                payment: payment._id,
              },
            }
          )
        } else {
          //ampunt is 0 mean item is free
          // console.log('amount is 0, mean item is free') //order update
          await Order.findByIdAndUpdate(newOrder._id, {
            $set: {
              paymentMode: 'online',
              paymentReceipt,
              paymentNotes,
              amountPaid,
              amountDue: 0,
              invoiceId,
              paid: true,
              paymentStatus: 'paid',
              status: 'placed',
            },
          })
          //for orderitem update
          await OrderItem.updateMany(
            { orderId: newOrder._id },
            {
              $set: {
                paymentMode: 'online',
                paymentReceipt,
                paymentNotes,
                amountPaid,
                amountDue: 0,
                invoiceId,
                paid: true,
                paymentStatus: 'paid',
                status: 'placed',
              },
            }
          )
        }

        //this function will update stock , send confirmation sms,check subscription bought or not
        await confirmOrder(newOrder.id)

        clearCart(req)

        return Order.findById(newOrder._id).populate(
          'items.vendor user orderItems store payment'
        )
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    create: async (
      root,
      args: { address: string; comment: string },
      { req }: { req: Request }
    ): Promise<OrderDocument> => {
      // await validate(orderSchema, args)
      console.log(args)
      const { userId } = req.session
      try {
        const order = new Order({ ...args, uid: userId })
        await order.save()
        // const order = await Order.create(req, { ...args, uid: userId })
        return order
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    paySuccessPageHit: async (
      root,
      args,
      { req }: { req: Request }
    ): Promise<any> => {
      try {
        const order = await Order.findByIdAndUpdate(
          args.id,
          { $inc: { paySuccess: 1 } },
          { new: true }
        )
        if (!order) throw new Error('invalid order-id')
        await OrderItem.updateMany(
          { orderId: args.id },
          { $inc: { paySuccess: 1 } }
        )
        if (order.paySuccess < 2) clearCart(req)
        return order.paySuccess
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    createOrder: async (root, args, { req }) => {
      try {
        const newOrder: any = await placeOrderViaAdmin(req, {
          address: args.address,
          userId: args.user,
          items: args.items,
        })
        const amount = Math.round(newOrder.amount.total)
        //setting check
        const settings = await Setting.findOne({})
        const customerName =
          newOrder.address.userFirstName ||
          newOrder.userFirstName ||
          settings.websiteName
        const customerPhone =
          newOrder.address.phone || newOrder.userPhone || '9999999999'
        const customerEmail =
          newOrder.address.email || newOrder.userEmail || 'hi@litekart.in'
        //setup payment Data ( we will need it for order and orderItem update too)
        const paymentOrderId = null,
          amountDue = amount,
          amountPaid = 0,
          currency = settings.currencyCode,
          invoiceId = newOrder._id,
          orderId = newOrder._id.toString(),
          paid = false,
          paymentMode = 'COD',
          paymentNotes = { phone: newOrder.user.phone, purpose: '' },
          // paymentReceipt = newOrder.cartId.toString(),
          paymentStatus = 'created',
          // receipt = newOrder.cartId.toString(),
          store = newOrder.store
        // captured = true, // This is only to identify COD and online PAID cases in order history

        const payment = await Payment.create({
          amountDue,
          amountPaid,
          captured: false,
          contact: customerPhone,
          customerName: customerName,
          currency,
          email: customerEmail,
          errorCode: null,
          errorDescription: null,
          fee: 0,
          invoiceId,
          orderId,
          notes: paymentNotes,
          paymentMode,
          paymentOrderId,
          // receipt,
          status: 'pending',
          store,
        })

        await Order.findByIdAndUpdate(newOrder._id, {
          $set: {
            amountDue,
            amountPaid,
            invoiceId,
            paid,
            payment: payment._id,
            paymentAmount: amount,
            paymentMode,
            paymentNotes,
            paymentOrderId,
            // paymentReceipt,
            paymentStatus,
            status: 'Ordered',
          },
        })
        await OrderItem.updateMany(
          { orderId: newOrder._id },
          {
            $set: {
              amountDue,
              amountPaid,
              invoiceId,
              paid,
              payment: payment._id,
              paymentAmount: amount,
              paymentMode,
              paymentNotes,
              paymentOrderId,
              // paymentReceipt,
              paymentStatus,
              status: 'Ordered',
            },
          }
        )
        return Order.findById(newOrder._id).populate(
          'items.vendor user orderItems store payment'
        )
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    returnOrReplace: async (root, args, { req }) => {
      try {
        // console.log(args)
        const orderData = await Order.findById(args.orderId).populate(
          'orderItems'
        )
        if (!orderData) throw new Error('Order not found')

        const product = await Product.findById(args.pId)
        if (!product) throw new Error('product not found')
        let qty = args.qty
        //
        for (let item of orderData.items) {
          if (item.pid == args.pId) {
            if (!args.qty) {
              qty = item.qty
            } else {
              if (args.qty > item.qty) qty = item.qty
            }
            console.log(
              'Initiating return or replace in order.item',
              product.name
            )
            //for validity
            const today = dayjs(new Date())
            const validTill = dayjs(item.returnValidTill)
            if (args.requestType == 'replace') {
              // IN CASE OF REPLACE PRODUCT
              if (!product.replaceAllowed)
                throw new Error('replacement not allowed for this product')
              if (item.status.toLowerCase() != 'delivered')
                throw new Error('Your order is in process')
              //
              if (today.isBefore(validTill)) {
                item.status = 'Replacement'
                item.returnReason = args.reason
                //update in orderHistory
                for (let oh of item.orderHistory) {
                  if (oh.status.toLowerCase() == 'replace') {
                    oh.time = dayjs()
                  }
                }
              } else {
                throw new Error('replacement period expired ')
              }
            } else {
              // IN CASE OF RETURN PRODUCT
              // if (!product.returnAllowed)
              //   throw new Error('return not allowed for this product')
              // if (item.status.toLowerCase() != 'delivered')
              //   throw new Error('Your order is in process')
              // if (today.isBefore(validTill)) {
              //   item.status = 'return process intiated'
              item.returnReason = args.reason
              // update in orderHistory
              for (let oh of item.orderHistory) {
                if (oh.status.toLowerCase() == 'return') {
                  oh.time = dayjs()
                }
              }
              // } else {
              //   throw new Error('return period expired')
              // }
            }
          }
        }
        await orderData.save()
        //do it for orderItem
        for (let item of orderData.orderItems) {
          if (item.pid == args.pId) {
            console.log(
              'Initiating return or replace in orderItem',
              product.name
            )

            //for validity
            const today = dayjs(new Date())
            const validTill = dayjs(item.returnValidTill)
            if (item.status.toLowerCase() != 'delivered')
              throw new Error('Your order is in process')

            if (args.requestType == 'replace') {
              if (today.isBefore(validTill)) {
                item.status = 'Replacement'
              }
              //update in orderHistory
              for (let oh of item.orderHistory) {
                if (oh.status.toLowerCase() == 'replace') {
                  oh.time = dayjs()
                }
              }
              item.returnReason = args.reason
            } else {
              if (today.isBefore(validTill)) {
                item.status = 'Return'
              }
              //update in orderHistory
              for (let oh of item.orderHistory) {
                if (oh.status.toLowerCase() == 'return') {
                  oh.time = dayjs()
                }
              }
              item.returnReason = args.reason
            }
          }
          await item.save()
        }
        //service bus
        await returnOrReplaceServiceBusHook({
          orderNo: orderData.orderNo,
          barcode: product.barcode,
          qty: qty,
        })
        return orderData
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    downloadInvoice: async (root, args, { req }) => {
      try {
        const { orderItemId } = args
        const orderItem = await OrderItem.findById(orderItemId)
        // if (!orderItem.awbNumber) {
        //   throw new UserInputError('Please Download invoice after 30 minutes ')
        // }
        orderItem.awbNumber = '843494830384'
        if (!orderItem.invoiceLink) {
          // console.log('generating invoice link')
          const url = await generateInvoice(orderItem)
          if (!url) throw new Error('Please try after some time')
          //update order.item
          const order = await Order.findOneAndUpdate(
            { _id: orderItem.orderId, 'items.pid': orderItem.pid },
            {
              $set: {
                'items.$.invoiceLink': url,
              },
            },
            { new: true }
          )
          //update orderItem
          await OrderItem.findByIdAndUpdate(orderItemId, {
            $set: { invoiceLink: url },
          })
          return order
        } else {
          console.log('invoice link already there')
          const order = await Order.findById(orderItem.orderId)
          return order
        }
      } catch (e) {
        throw new UserInputError(e)
      }
    },
  },

  Subscription: {
    orderUpdated: {
      resolve: (
        { orderUpdated }: { orderUpdated: OrderDocument },
        args,
        ctx,
        info
      ) => {
        orderUpdated.id = orderUpdated._id
        return hasSubfields(info)
          ? Order.findById(orderUpdated._id, fields(info))
          : orderUpdated
      },
      subscribe: withFilter(
        () => pubsub.asyncIterator(ORDER_UPDATED),
        async (
          { orderUpdated }: { orderUpdated: OrderDocument },
          { id }: { id: string },
          { req }: { req: Request }
        ) => {
          return orderUpdated._id == id
        }
      ),
    },
  },
}

export default resolvers
