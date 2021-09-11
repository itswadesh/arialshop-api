import { IResolvers, UserInputError } from 'apollo-server-express'
import { Request, BrandDocument } from '../types'
import { objectId } from '../validation'
import { Brand, Setting, Slug, Store, User } from '../models'
import { fields, index, generateSlug } from '../utils'
import { deleteFileFromUrlAll } from '../utils'

const resolvers: IResolvers = {
  Query: {
    brands: async (root, args, { req }: { req: Request }, info) => {
      args.populate = 'parent store'
      try {
        //checking store
        const settings = await Setting.findOne()
        if (!settings) throw new Error('Something went wrong')
        let isMultiStore = false
        if (settings.isMultiStore) isMultiStore = true
        args.sort = args.sort || 'position'
        return index({ model: Brand, args, info, isMultiStore })
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    parentBrands: (root, args, { req }: { req: Request }, info) => {
      args.parent = null
      try {
        args.sort = args.sort || 'position'
        return index({ model: Brand, args, info })
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    brand: async (
      root,
      args: { id: string; slug: string },
      ctx,
      info
    ): Promise<BrandDocument | null> => {
      try {
        if (args.id) {
          await objectId.validateAsync(args)
          return Brand.findById(args.id, fields(info)).populate('parent store')
        } else {
          return Brand.findOne({ slug: args.slug }, fields(info)).populate(
            'parent store'
          )
        }
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    brand1: async (
      root,
      args: { id: string; slug: string },
      ctx,
      info
    ): Promise<BrandDocument | null> => {
      try {
        if (args.id) {
          await objectId.validateAsync(args)
          return Brand.findById(args.id, fields(info))
        } else {
          return Brand.findOne({ slug: args.slug }, fields(info))
        }
      } catch (e) {
        throw new UserInputError(e)
      }
    },
  },
  Mutation: {
    deleteBrand: async (
      root,
      args,
      { req }: { req: Request }
    ): Promise<boolean> => {
      try {
        const brand: any = await Brand.findByIdAndDelete(args.id)
        if (brand) {
          await deleteFileFromUrlAll({ url: brand.img, force: true })
          await Slug.deleteOne({ slug: brand.slug })
          return true
        } else {
          return false
        }
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    saveBrand: async (
      root,
      args,
      { req }: { req: Request }
    ): Promise<BrandDocument | null> => {
      const { userId } = req.session
      try {
        const settings = await Setting.findOne()
        if (!settings) throw new Error('Something went wrong')
        if (settings.isMultiStore) {
          const user = await User.findById(userId)
          if (!user.store) throw new Error('You have not own a store')
          const store = await Store.findById(user.store)
          if (!store) throw new Error('Your store does not exist')
          args.store = store._id
        }

        if (args.parent) {
          const parent = await Brand.findById(args.parent)
          if (!parent) throw new Error('invalid parent-id')
        }
        if (args.id == 'new') {
          const brand = await Brand.findOne({
            name: args.name,
            store: args.store,
          }).collation({
            locale: 'tr',
            strength: 1,
          })
          if (brand)
            throw new Error(
              'brand already existed,can not create new brand with same name'
            )
          if (args.slug)
            args.slug = await generateSlug(
              args.slug,
              'brand',
              '',
              'string',
              args.store
            )
          args.user = userId
          return await Brand.create(args)
        } else {
          let slug
          if (args.slug) {
            slug = args.slug
            delete args.slug
          }
          const brand = await Brand.findOneAndUpdate(
            { _id: args.id },
            { ...args, user: userId },
            { new: true, upsert: true }
          )
          // console.log('the updated brand is:', brand)
          if (slug)
            brand.slug = await generateSlug(
              slug,
              'brand',
              brand.slug,
              'string',
              args.store
            )
          // console.log('the updated brand is:', brand)
          await brand.save() // To fire pre save hoook
          return brand
        }
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    syncBrands: async (
      root,
      args,
      { req }: { req: Request }
    ): Promise<Number> => {
      const brands = await Brand.find()
      for (let b of brands) {
        if (b.brand_id) {
          b.brandId = b.brand_id
          await b.save()
        }
      }
      return brands.length
    },
  },
}

export default resolvers
