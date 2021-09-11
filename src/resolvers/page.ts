import { Types } from 'mongoose'
import {
  IResolvers,
  UserInputError,
  ForbiddenError,
  withFilter,
} from 'apollo-server-express'
import { Request, PageDocument } from '../types'
import { validate, objectId } from '../validation'
import { Page, Setting, Slug, Store, User } from '../models'
import { fields, hasSubfields, index, generateSlug } from '../utils'
import { pageSchema } from '../validation/page'

const resolvers: IResolvers = {
  Query: {
    pages: async (root, args, ctx, info) => {
      try {
        //checking store
        const settings = await Setting.findOne()
        if (!settings) throw new Error('Something went wrong')
        let isMultiStore = false
        if (settings.isMultiStore) isMultiStore = true

        return index({ model: Page, args, info, isMultiStore })
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    pageSlug: async (
      root,
      args: { slug: string },
      ctx,
      info
    ): Promise<PageDocument | null> => {
      try {
        // await objectId.validateAsync(args)
        return Page.findOne({ slug: args.slug }, fields(info))
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    page: async (
      root,
      args: { id: string },
      ctx,
      info
    ): Promise<PageDocument | null> => {
      try {
        if (args.id != 'new') {
          await objectId.validateAsync(args)
          return Page.findById(args.id, fields(info))
        } else {
          return null
        }
      } catch (e) {
        throw new UserInputError(e)
      }
    },
  },
  Mutation: {
    removePage: async (
      root,
      args,
      { req }: { req: Request }
    ): Promise<boolean | null> => {
      const { userId } = req.session
      try {
        const page = await Page.findById(args.id)
        if (!page) throw new UserInputError('Page not found')
        const user = await User.findById(userId)
        if (!user) throw new UserInputError('Please login again to continue')
        if (user.role != 'admin' && page.user == userId)
          throw new UserInputError('Page does not belong to you')
        await Slug.deleteOne({ slug: page.slug })
        const o = await Page.deleteOne({ _id: args.id })
        return o.ok == 1
      } catch (e) {
        throw new UserInputError(e)
      }
    },

    savePage: async (
      root,
      args,
      { req }: { req: Request }
    ): Promise<PageDocument> => {
      // await validate(pageSchema, args)
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
        if (args.id == 'new') {
          if (args.slug)
            args.slug = await generateSlug(
              args.slug,
              'page',
              '',
              'string',
              null
            )
          args.user = userId
          return await Page.create(args)
        } else {
          let slug
          if (args.slug) {
            slug = args.slug
            delete args.slug
          }
          const page = await Page.findOneAndUpdate(
            { _id: args.id || Types.ObjectId() },
            { ...args, user: userId },
            { new: true, upsert: true }
          )
          // console.log('the updated page is:', page)
          if (slug)
            page.slug = await generateSlug(
              slug,
              'page',
              page.slug,
              'string',
              null
            )
          // console.log('the updated page is:', page)
          await page.save() // To fire pre save hoook
          return page
        }
      } catch (e) {
        throw new UserInputError(e)
      }
    },
  },
}

export default resolvers
