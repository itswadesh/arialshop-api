import { IResolvers, UserInputError } from 'apollo-server-express'
import { Request, FaqTopicDocument } from '../types'
import { FaqTopic, Setting, Slug, Store, User } from '../models'
import { fields, index, generateSlug } from '../utils'

const resolvers: IResolvers = {
  Query: {
    faqTopics: async (root, args, { req }: { req: Request }, info) => {
      try {
        //checking store
        const settings = await Setting.findOne()
        if (!settings) throw new Error('Something went wrong')
        let isMultiStore = false
        if (settings.isMultiStore) isMultiStore = true

        return index({ model: FaqTopic, args, info, isMultiStore })
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    faqTopic: async (
      root,
      args: { id: string },
      ctx,
      info
    ): Promise<FaqTopicDocument | null> => {
      try {
        return FaqTopic.findById(args.id, fields(info))
      } catch (e) {
        throw new UserInputError(e)
      }
    },
  },
  Mutation: {
    deleteFaqTopic: async (
      root,
      args,
      { req }: { req: Request }
    ): Promise<boolean> => {
      try {
        const faqTopic: any = await FaqTopic.findByIdAndDelete(args.id)
        if (faqTopic) {
          await Slug.deleteOne({ slug: faqTopic.slug })
          return true
        } else {
          return false
        }
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    saveFaqTopic: async (
      root,
      args,
      { req }: { req: Request }
    ): Promise<FaqTopicDocument | null> => {
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
        if (args.id == 'new') return await FaqTopic.create(args)
        else {
          const faqTopic = await FaqTopic.findOneAndUpdate(
            { _id: args.id },
            { ...args, uid: userId },
            { new: true, upsert: true }
          )
          // console.log('the updated faqTopic is:', faqTopic)
          await faqTopic.save() // To fire pre save hoook
          return faqTopic
        }
      } catch (e) {
        throw new UserInputError(e)
      }
    },
  },
}

export default resolvers
