import { Types } from 'mongoose'
import {
  IResolvers,
  UserInputError,
  ForbiddenError,
  withFilter,
} from 'apollo-server-express'
import { Request, UserDocument, CartDocument } from '../types'
import { validate, objectId, cartSchema } from '../validation'
import { Cart, Setting, User } from '../models'
import { fields, hasSubfields, index } from '../utils'
import { clearCart, addToCart, refreshCart } from '../utils/cart'
import { TrunkInstance } from 'twilio/lib/rest/trunking/v1/trunk'

const resolvers: IResolvers = {
  Query: {
    abandoned: async (root, args, { req }: { req: Request }, info) => {
      const { userId } = req.session
      try {
        const user = await User.findById(userId)
        if (!user) throw new UserInputError('You are not authorized')
        if (user.role != 'admin' && user.role !== 'super')
          args['items.vendor'] = userId
        args.populate = 'store'
        const settings = await Setting.findOne()
        if (!settings) throw new Error('Something went wrong')
        let isMultiStore = false
        if (settings.isMultiStore) isMultiStore = true

        return index({ model: Cart, args, info, isMultiStore })
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    //Admin can see whole carts those saved in database
    carts: async (root, args, { req }: { req: Request }, info) => {
      try {
        args.populate = 'store'
        const settings = await Setting.findOne()
        if (!settings) throw new Error('Something went wrong')
        let isMultiStore = false
        if (settings.isMultiStore) isMultiStore = true

        return index({ model: Cart, args, info, isMultiStore })
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    getCartQty: async (
      root,
      args,
      { req }: { req: Request },
      info
    ): Promise<number> => {
      const { userId } = req.session
      try {
        return 10
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    //This will show all products those presents in current logged in user cart
    cart: async (
      root,
      args,
      { req }: { req: Request },
      info
    ): Promise<CartDocument | null> => {
      // This is also responsible for clearing cart after pay success
      const { userId } = req.session
      // let cart = null
      try {
        // if (!userId) cart = req.session.cart
        // else
        //   cart = await Cart.findOne({ uid: userId }).populate(
        //     'items.vendor items.brand'
        //   )
        // if (!cart) cart = req.session.cart
        // await refreshCart(req)
        // return cart || req.session.cart
        await refreshCart(req)
        const cart = await Cart.findOne({ uid: userId }).populate(
          'items.vendor items.brand'
        )
        return cart || req.session.cart
      } catch (e) {
        throw new UserInputError(e)
      }
    },
  },
  Mutation: {
    //This will allow us to add product into our cart(need productId, varientId,and quantity)
    addToCart: async (
      root,
      args: {
        pid: string
        vid: string
        options: string
        vendor: string
        qty: number
        replace: boolean
      },
      { req }: { req: Request }
    ): Promise<CartDocument> => {
      const { userId } = req.session
      let cart = null
      try {
        await validate(cartSchema, args)
        const { pid, vid, qty, options, vendor, replace } = args
        // const cart = await Cart.create({ pid, vid, qty})
        // await cart.save()
        await addToCart(req, { pid, vid, qty, options, replace })
        await refreshCart(req)
        if (!userId) cart = req.session.cart
        else
          cart = await Cart.findOne({ uid: userId }).populate(
            'items.vendor items.brand '
          )
        return cart
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    //this will empty the current logged in user cart
    clearCart: async (root, _, { req }: { req: Request }): Promise<boolean> => {
      try {
        clearCart(req)
        return true
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    deleteCart: async (
      root,
      args: {
        id: string
      },
      { req }: { req: Request }
    ): Promise<boolean> => {
      const { id } = args
      try {
        await Cart.findByIdAndDelete(id)
        return true
      } catch (e) {
        throw new UserInputError(e)
      }
    },
  },
}

export default resolvers
