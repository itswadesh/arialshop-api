import { Types } from 'mongoose'
import { IResolvers, UserInputError } from 'apollo-server-express'
import { Request } from '../types'
import { OrderItem, Product, User, Setting, Store } from '../models'

const resolvers: IResolvers = {
  Query: {
    salesByDay: async (root, args, { req }: { req: Request }, info) => {
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
          args.store = Types.ObjectId(store._id)
        }
        const data: any = await OrderItem.aggregate([
          { $match: args },
          {
            $group: {
              _id: {
                $dateToString: { format: '%Y-%m-%d', date: '$updatedAt' },
              },
              totalAmount: { $sum: '$amount.total' },
              qty: { $sum: '$amount.qty' },
            },
          },
          { $sort: { _id: 1 } },
        ]).exec()
        // console.log('day Sales data is:', data)
        return data
      } catch (err) {
        console.log(err)
      }
    },
    salesByMonth: async (root, args, { req }: { req: Request }, info) => {
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
          args.store = Types.ObjectId(store._id)
        }
        const data: any = await OrderItem.aggregate([
          { $match: args },
          {
            $group: {
              _id: {
                $dateToString: { format: '%Y-%m', date: '$updatedAt' },
              },
              totalAmount: { $sum: '$amount.total' },
              qty: { $sum: '$amount.qty' },
            },
          },
          { $sort: { _id: 1 } },
        ]).exec()
        // console.log('month Sales data is:', data)
        return data
      } catch (err) {
        console.log(err)
      }
    },
    salesByProduct: async (root, args, { req }: { req: Request }, info) => {
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
          args.store = Types.ObjectId(store._id)
        }
        const data: any = await OrderItem.aggregate([
          { $match: args },
          {
            $group: {
              _id: '$pid',
              totalAmount: { $sum: '$amount.total' },
              qty: { $sum: '$amount.qty' },
            },
          },
          { $sort: { _id: 1 } },
        ]).exec()
        await Product.populate(data, { path: '_id' })

        // console.log('month Sales data is:', data)
        return data
      } catch (err) {
        console.log(err)
      }
    },
    salesByCustomer: async (root, args, { req }: { req: Request }, info) => {
      try {
        let data = await OrderItem.aggregate([
          {
            $group: {
              _id: '$user',
              totalAmount: { $sum: '$amount.total' },
              qty: { $sum: '$amount.qty' },
            },
          },
        ])
        await User.populate(data, { path: '_id' })
        return data
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    paymentsByType: async (root, args, { req }: { req: Request }, info) => {
      try {
        let data = await OrderItem.aggregate([
          {
            $group: {
              _id: '$paymentMode',
              totalAmount: { $sum: '$amount.total' },
              qty: { $sum: '$amount.qty' },
            },
          },
        ])

        return data
      } catch (e) {
        throw new UserInputError(e)
      }
    },
  },
}

export default resolvers
