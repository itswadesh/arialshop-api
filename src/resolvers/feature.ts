import { IResolvers, UserInputError } from 'apollo-server-express'
import { Request, FeatureDocument } from '../types'
import { validate, objectId } from '../validation'
import { Feature, Product, Setting, Slug, Store, User } from '../models'
import { fields, index, generateSlug } from '../utils'
import { Types } from 'mongoose'

const resolvers: IResolvers = {
  Query: {
    features: async (root, args, { req }: { req: Request }, info) => {
      const { userId } = req.session
      try {
        const user = await User.findById(userId)
        if (!user) args.active = true
        if (user && user.role != 'admin' && user.role !== 'super')
          args.active = true
        //checking store
        const settings = await Setting.findOne()
        if (!settings) throw new Error('Something went wrong')
        let isMultiStore = false
        if (settings.isMultiStore) {
          isMultiStore = true
          args.populate = 'store'
        }
        return index({ model: Feature, args, info, isMultiStore })
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    feature: async (
      root,
      args: { id: string },
      ctx,
      info
    ): Promise<FeatureDocument | null> => {
      try {
        return Feature.findById(args.id, fields(info)).populate('store')
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    productFeatures: async (
      root,
      args,
      { req }: { req: Request },
      info
    ): Promise<FeatureDocument | null> => {
      // console.log('AA', args)
      try {
        const x = await index({ model: Feature, args, info })
        // console.log('A', x)
        //@ts-ignore
        return x
      } catch (e) {
        throw new UserInputError(e)
      }
    },
  },
  Mutation: {
    removeFeature: async (
      root,
      args,
      { req }: { req: Request }
    ): Promise<boolean | null> => {
      try {
        const feature: any = await Feature.findByIdAndDelete(args.id)
        await Product.updateOne(
          { _id: feature.product },
          { $pull: { features: args.id } }
        )
        if (feature) {
          await Slug.deleteOne({ slug: feature.slug })
          return true
        } else {
          return false
        }
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    saveFeature: async (
      root,
      args,
      { req }: { req: Request }
    ): Promise<FeatureDocument | null> => {
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
          const product = await Product.findById(args.product)
          if (!product) throw new UserInputError('Product not found')
          const feature = await Feature.findOne({
            name: args.name,
            product: args.product,
          }).collation({
            locale: 'tr',
            strength: 1,
          })
          if (feature)
            throw new Error(
              'feature already existed in this product,can not create new feature with same name in this product'
            )
          delete args.id
        }
        const feature = await Feature.findOneAndUpdate(
          { _id: args.id || Types.ObjectId() },
          { $set: { ...args, user: userId } },
          { upsert: true, new: true }
        )
        // console.log('the updated feature is:', feature)
        await feature.save() // To fire pre save hoook
        if (args.type == 'specification') {
          await Product.findByIdAndUpdate(args.product, {
            $addToSet: { features: feature._id },
          })
        } else {
          await Product.findByIdAndUpdate(args.product, {
            $addToSet: { productDetails: feature._id },
          })
        }
        return feature
      } catch (e) {
        throw new UserInputError(e)
      }
    },
  },
}

export default resolvers
