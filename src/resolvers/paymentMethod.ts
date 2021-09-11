import { IResolvers, UserInputError } from 'apollo-server-express'
import { Request, PaymentMethodDocument } from '../types'
import { objectId } from '../validation'
import { PaymentMethod, Setting, Slug, Store, User } from '../models'
import { fields, index, deleteFileFromUrlAll } from '../utils'
import { ObjectId } from 'mongodb'

const resolvers: IResolvers = {
  Query: {
    // for end user
    paymentMethods: async (root, args, { req }: { req: Request }, info) => {
      const { userId } = req.session
      try {
        args.active = true
        args.sort = args.sort || 'position'
        //checking store
        const settings = await Setting.findOne()
        if (!settings) throw new Error('Something went wrong')
        let isMultiStore = false
        if (settings.isMultiStore) {
          isMultiStore = true
          args.populate = 'store'
        }
        return index({ model: PaymentMethod, args, info, isMultiStore })
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    paymentMethodsAdmin: async (
      root,
      args,
      { req }: { req: Request },
      info
    ) => {
      const { userId } = req.session
      try {
        // const user = await User.findById(userId)
        args.user = userId
        args.sort = args.sort || 'position'
        //checking store
        const settings = await Setting.findOne()
        if (!settings) throw new Error('Something went wrong')
        let isMultiStore = false
        if (settings.isMultiStore) {
          isMultiStore = true
          args.populate = 'store'
        }
        return index({ model: PaymentMethod, args, info, isMultiStore })
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    paymentMethod: async (
      root,
      args: { id: string; slug: string },
      ctx,
      info
    ): Promise<PaymentMethodDocument | null> => {
      try {
        if (args.id) {
          await objectId.validateAsync(args)
          return PaymentMethod.findById(args.id, fields(info)).populate('store')
        } else {
          return PaymentMethod.findOne(
            { slug: args.slug },
            fields(info)
          ).populate('store')
        }
      } catch (e) {
        throw new UserInputError(e)
      }
    },
  },
  Mutation: {
    deletePaymentMethod: async (
      root,
      args,
      { req }: { req: Request }
    ): Promise<boolean> => {
      try {
        const paymentMethod: any = await PaymentMethod.findByIdAndDelete(
          args.id
        )
        if (paymentMethod) {
          await deleteFileFromUrlAll({ url: paymentMethod.img, force: true })
          await Slug.deleteOne({ slug: paymentMethod.slug })
          return true
        } else {
          return false
        }
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    savePaymentMethod: async (
      root,
      args,
      { req }: { req: Request }
    ): Promise<PaymentMethodDocument | null> => {
      const { userId } = req.session
      //checking store
      const settings = await Setting.findOne()
      if (!settings) throw new Error('Something went wrong')
      let storeId
      if (settings.isMultiStore) {
        const user = await User.findById(userId)
        if (!user.store) throw new Error('You have not own a store')
        const store = await Store.findById(user.store)
        if (!store) throw new Error('Your store does not exist')
        args.store = store._id
      }
      args.user = userId
      let paymentMethod
      try {
        if (args.id == 'new') {
          if (!args.value) throw new Error('value must be provide')
          const found = await PaymentMethod.findOne({
            store: storeId,
            value: args.value,
          })
          if (found && args.value != 'COD')
            throw new Error(
              `Store contain already ${args.value} paymeny method`
            )
          paymentMethod = await PaymentMethod.create(args)
        } else {
          if (!ObjectId.isValid(args.id)) {
            throw new UserInputError('Record not found')
          }
          paymentMethod = await PaymentMethod.findOneAndUpdate(
            { _id: args.id },
            args,
            { new: true, upsert: true }
          )
          await paymentMethod.save() // To fire pre save hoook
        }
        return paymentMethod
      } catch (e) {
        throw new UserInputError(e)
      }
    },
  },
}

export default resolvers
