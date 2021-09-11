import { IResolvers, UserInputError } from 'apollo-server-express'
import { fields, index } from '../utils'
import { Request, ProductDocument } from '../types'
import { Product, Store, User, Setting } from '../models'
import {
  googleMerchantDeleteProduct,
  googleMerchantGetProduct,
  googleMerchantInsertProduct,
  googleMerchantListProduct,
  googleMerchantCustomBatchInsertProduct,
  fbProducts,
  fbProduct,
  fbSyncProduct,
} from '../utils'

const resolvers: IResolvers = {
  Query: {
    gListProduct: async (root, args, { req }: { req: Request }, info) => {
      try {
        const { userId } = req.session
        await googleMerchantListProduct(args.authCode)
        return
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    gGetProduct: async (
      root,
      args: { productId: string; authCode: string },
      ctx,
      info
    ): Promise<ProductDocument | null> => {
      try {
        const { authCode, productId } = args
        const product = await Product.findById(productId)
        if (!product) throw new UserInputError('product not exist')
        if (!product.googleMerchantProductId)
          throw new UserInputError(
            'This product not have googleMerchantProductId'
          )
        let merchantProductId = product.googleMerchantProductId
        await googleMerchantGetProduct({ authCode, merchantProductId })
        return product
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    fbListProduct: async (root, args, { req }: { req: Request }, info) => {
      try {
        const { userId } = req.session
        const list = await fbProducts('short_lived_token')
        // console.log('list', list)
        return list
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    fbProduct: async (root, args, { req }: { req: Request }, info) => {
      try {
        const { userId } = req.session
        const res = await fbProduct({
          short_lived_token: 'short_lived_token',
          productId: args.fbProductId,
        })
        // console.log('res', res)
        return res
      } catch (e) {
        // console.log('err', e)
        throw new UserInputError(e)
      }
    },
  },
  Mutation: {
    gDeleteProduct: async (
      root,
      args,
      { req }: { req: Request }
    ): Promise<boolean> => {
      try {
        const { authCode, productId } = args
        const res = await googleMerchantDeleteProduct({ authCode, productId })
        if (res) {
          return true
        } else {
          return false
        }
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    gInsertProduct: async (
      root,
      args,
      { req }: { req: Request }
    ): Promise<boolean> => {
      const { userId } = req.session
      const { authCode, productId } = args
      try {
        const product = await (
          await Product.findById(productId)
        ).populate('brand color size')
        if (!product) throw new Error('invalid productId')
        const result = await googleMerchantInsertProduct({ authCode, product })
        if (result) {
          if (result.id) {
            await Product.findByIdAndUpdate(productId, {
              $set: { googleMerchantProductId: result.id },
            })
            return true
          }
        }
        return false
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    SyncProductsToGoogle: async (
      root,
      args,
      { req }: { req: Request }
    ): Promise<boolean> => {
      const { userId } = req.session
      let { authCode, batchId, category, contentLanguage, targetCountry } = args
      if (!targetCountry) targetCountry = 'IN'
      if (!contentLanguage) contentLanguage = 'en'
      try {
        let products = []
        const settings = await Setting.findOne()
        if (!settings) throw new Error('Something went wrong')
        if (settings.isMultiStore) {
          const user = await User.findById(userId)
          if (!user.store) throw new Error('You have not own a store')
          const store = await Store.findById(user.store)
          if (!store) throw new Error('Your store does not exist')
          products = await Product.find({ store: store._id }).populate(
            'brand color size'
          )
        } else {
          products = await Product.find().populate('brand color size')
        }

        if (products.length < 1)
          throw new Error('you do not have products in your store')
        const result = await googleMerchantCustomBatchInsertProduct({
          batchId,
          authCode,
          products,
        })

        return false
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    fbInsertProduct: async (
      root,
      args,
      { req }: { req: Request }
    ): Promise<boolean> => {
      const { userId } = req.session
      const { productId } = args
      try {
        const product = await Product.find({ _id: productId }).populate(
          'brand color size'
        )
        if (!product) throw new Error('invalid productId')
        const setting = await Setting.findOne()
        if (!setting) throw new Error('invalid setting')

        await fbSyncProduct({
          products: product,
          short_lived_token: 'short_lived_token',
          operation: 'create',
          setting,
        })
        return true
      } catch (e) {
        console.log('error in fbInsertProduct...')
        throw new UserInputError(e)
      }
    },
    SyncProductsToFacebook: async (
      root,
      args,
      { req }: { req: Request }
    ): Promise<number> => {
      const { userId } = req.session
      const { productId } = args
      try {
        let products = []
        const settings = await Setting.findOne()
        if (!settings) throw new Error('Something went wrong')
        if (settings.isMultiStore) {
          const user = await User.findById(userId)
          if (!user.store) throw new Error('You have not own a store')
          const store = await Store.findById(user.store)
          if (!store) throw new Error('Your store does not exist')
          products = await Product.find({ store: store._id }).populate(
            'brand color size'
          )
        } else {
          products = await Product.find().populate('brand color size')
        }

        if (products.length < 1)
          throw new Error('you do not have products in your store')
        const setting = await Setting.findOne()
        if (!setting) throw new Error('invalid setting')

        await fbSyncProduct({
          products,
          short_lived_token: 'short_lived_token',
          operation: 'create',
          setting,
        })
        return products.length
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    fbDeleteProduct: async (
      root,
      args,
      { req }: { req: Request }
    ): Promise<boolean> => {
      try {
        const { authCode, productId } = args
        const product = await Product.find({ _id: productId })
        if (!product) throw new Error('invalid productId')
        await fbSyncProduct({
          products: product,
          short_lived_token: 'short_lived_token',
          operation: 'delete',
        })
        return true
      } catch (e) {
        throw new UserInputError(e)
      }
    },
  },
}

export default resolvers
