import { IResolvers, UserInputError } from 'apollo-server-express'
import { Request } from '../types'
import { Product, User, Wishlist } from '../models'
import { index } from '../utils'

const resolvers: IResolvers = {
  Query: {
    //Only admin can see wishlist of all user
    wishlists: async (root, args, { req }: { req: Request }, info) => {
      const { userId } = req.session
      try {
        const user = await User.findById(userId)
        if (!user) args.user = userId
        if (user && user.role !== 'admin' && user.role !== 'super')
          args['user'] = userId
        args.populate = {
          path: 'product variant user store',
          populate: {
            path: 'brand',
          },
        }
        return index({ model: Wishlist, args, info, isMultiStore: true })
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    //LoggedIn user wishlist
    myWishlist: async (root, args, { req }: { req: Request }, info) => {
      const { userId } = req.session
      args.populate = {
        path: 'product variant user store',
        populate: {
          path: 'brand',
        },
      }
      args.user = userId
      try {
        return index({ model: Wishlist, args, info, isMultiStore: true })
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    //check item exist in wishlist
    checkWishlist: async (
      root,
      args: { product: string; variant: string; user: string },
      { req }: { req: Request }
    ): Promise<boolean> => {
      const { userId } = req.session
      try {
        const count = await Wishlist.countDocuments({
          product: args.product,
          variant: args.variant,
          user: userId,
        })
        return count > 0
      } catch (e) {
        throw new UserInputError(e)
      }
    },
  },
  Mutation: {
    // updateWishlist: async (
    //   root,
    //   args,
    //   { req }: { req: Request }
    // ): Promise<WishlistDocument | null> => {
    //   const { userId } = req.session
    //   const wishlist = await Wishlist.findById(args.id)
    //   if (!wishlist) throw new UserInputError('Wishlist not found')
    //   const user = await User.findById(userId)
    //   if (!user) throw new UserInputError('Please login again to continue')
    //   if (user.role != 'admin' && wishlist.user == userId)
    //     throw new UserInputError('Wishlist does not belong to you')
    //   return await Wishlist.findByIdAndDelete({ _id: args.id })
    // },

    //For add an item into wishlist
    toggleWishlist: async (
      root,
      args,
      { req }: { req: Request }
    ): Promise<boolean> => {
      // if (args.id == 'new') delete args.id
      const { userId } = req.session
      try {
        const product = await Product.findById(args.product)
        if (!product) throw new Error('invalid product')
        const count = await Wishlist.countDocuments({
          product: args.product,
          variant: args.variant,
          user: userId,
        })
        if (count > 0) {
          await Wishlist.deleteOne({
            product: args.product,
            variant: args.variant,
            user: userId,
          })
        } else {
          await Wishlist.create({
            product: args.product,
            store: product.store,
            variant: args.variant,
            user: userId,
          })
        }
        return !(count > 0)
      } catch (e) {
        throw new UserInputError(e)
      }
    },
  },
}

export default resolvers
