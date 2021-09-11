import { IResolvers, UserInputError } from 'apollo-server-express'
import { Request, FaqDocument } from '../types'
import { Faq, Setting, Slug, Store, User } from '../models'
import { fields, index } from '../utils'

const resolvers: IResolvers = {
  Query: {
    faqs: async (root, args, { req }: { req: Request }, info) => {
      try {
        args.populate = 'store'
        args.active = true
        //checking store
        const settings = await Setting.findOne()
        if (!settings) throw new Error('Something went wrong')
        let isMultiStore = false
        if (settings.isMultiStore) isMultiStore = true

        return index({ model: Faq, args, info, isMultiStore })
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    faq: async (
      root,
      args: { id: string },
      ctx,
      info
    ): Promise<FaqDocument | null> => {
      try {
        return Faq.findById(args.id, fields(info)).populate('store')
      } catch (e) {
        throw new UserInputError(e)
      }
    },
  },
  Mutation: {
    deleteFaq: async (
      root,
      args,
      { req }: { req: Request }
    ): Promise<boolean> => {
      try {
        const faq: any = await Faq.findByIdAndDelete(args.id)
        if (faq) {
          await Slug.deleteOne({ slug: faq.slug })
          return true
        } else {
          return false
        }
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    saveFaq: async (
      root,
      args,
      { req }: { req: Request }
    ): Promise<FaqDocument | null> => {
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
          args.store = store._id
        }
        if (args.id == 'new') return await Faq.create(args)
        else {
          const faq = await Faq.findOneAndUpdate(
            { _id: args.id },
            { ...args, uid: userId },
            { new: true, upsert: true }
          )
          await faq.save() // To fire pre save hoook
          return faq
        }
      } catch (e) {
        throw new UserInputError(e)
      }
    },
  },
}

export default resolvers
