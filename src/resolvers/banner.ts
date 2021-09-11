import { IResolvers, UserInputError } from 'apollo-server-express'
import { Request, BannerDocument } from '../types'
import { Banner, Slug, Setting, Store, User } from '../models'
import { fields, index } from '../utils'
import { deleteFileFromUrlAll } from '../utils'
import { ObjectId } from 'mongodb'

const resolvers: IResolvers = {
  Query: {
    banners: async (root, args, { req }: { req: Request }, info) => {
      args.active = true
      try {
        const settings = await Setting.findOne()
        if (!settings) throw new Error('Something went wrong')
        let isMultiStore = false
        if (settings.isMultiStore) isMultiStore = true

        return index({ model: Banner, args, info, isMultiStore })
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    allBanners: async (root, args, { req }: { req: Request }, info) => {
      try {
        const { userId } = req.session
        const settings = await Setting.findOne()
        if (!settings) throw new Error('Something went wrong')
        let isMultiStore = false
        if (settings.isMultiStore) isMultiStore = true

        return index({
          model: Banner,
          args,
          info,
          isMultiStore,
          userId,
          attachStoreFromSession: true,
        })
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    banner: async (
      root,
      args: { id: string },
      ctx,
      info
    ): Promise<BannerDocument | null> => {
      try {
        return Banner.findById(args.id, fields(info))
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    //bannerGroup is used for grouping of banners (like- Trending)
    bannerGroup: async (root, args, { req }: { req: Request }, info) => {
      try {
        return index({ model: Banner, args, info })
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    groupByBanner: async (root, args, { req }: { req: Request }, info) => {
      try {
        // Filter only active, sortBy sort
        args.active = true
        if (args.store) args.store = new ObjectId(args.store)
        const data = await Banner.aggregate([
          // First Stage
          { $match: args },
          // Second Stage
          { $sort: { sort: 1 } },
          {
            $group: {
              _id: {
                title: '$groupTitle',
                // type: '$type',
                // pageId: '$pageId',
              },
              data: { $push: '$$ROOT' },
            },
          },
          // Third Stage
          { $sort: { sort: -1 } },
        ])
        return data
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    groupByBanner1: async (root, args, { req }: { req: Request }, info) => {
      try {
        args.active = true
        if (args.store) args.store = new ObjectId(args.store)
        const data = await Banner.aggregate([
          { $match: args },
          { $sort: { sort: 1 } },
          { $group: { _id: '$groupTitle', data: { $push: '$$ROOT' } } },
          { $sort: { sort: -1 } },
        ])
        return data
      } catch (e) {
        throw new UserInputError(e)
      }
    },
  },
  Mutation: {
    deleteBanner: async (
      root,
      args,
      { req }: { req: Request }
    ): Promise<boolean> => {
      try {
        const banner: any = await Banner.findByIdAndDelete(args.id)
        if (banner) {
          await deleteFileFromUrlAll({ url: banner.img, force: true })
          await Slug.deleteOne({ slug: banner.slug })
          return true
        } else {
          return false
        }
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    saveBanner: async (
      root,
      args,
      { req }: { req: Request }
    ): Promise<BannerDocument | null> => {
      const { userId } = req.session
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
      args.user = userId
      try {
        if (args.id == 'new') return await Banner.create(args)
        else {
          const banner = await Banner.findOneAndUpdate(
            { _id: args.id },
            { ...args, uid: userId },
            { new: true, upsert: true }
          )
          await banner.save() // To fire pre save hoook
          return banner
        }
      } catch (e) {
        throw new UserInputError(e)
      }
    },
  },
}

export default resolvers
