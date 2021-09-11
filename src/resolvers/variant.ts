import { IResolvers, UserInputError } from 'apollo-server-express'
import { Request, VariantDocument, ProductDocument } from '../types'
import { validate, objectId } from '../validation'
import { Variant, User, Product } from '../models'
import { fields, index } from '../utils'
import { Types } from 'mongoose'

const resolvers: IResolvers = {
  Query: {
    variants: async (root, args, { req }: { req: Request }, info) => {
      const { userId } = req.session
      try {
        const user = await User.findById(userId)
        if (!user) args.active = true
        if (user && user.role !== 'admin' && user.role !== 'super')
          args.active = true
        return index({ model: Variant, args, info })
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    variant: async (
      root,
      args: { id: string },
      ctx,
      info
    ): Promise<VariantDocument | null> => {
      try {
        return Variant.findById(args.id, fields(info))
      } catch (e) {
        throw new UserInputError(e)
      }
    },
  },
  Mutation: {
    removeVariant: async (
      root,
      args,
      { req }: { req: Request }
    ): Promise<boolean | null> => {
      const { userId } = req.session
      try {
        const variant = await Variant.findById(args.id)
        if (!variant) throw new UserInputError('Variant not found')
        const user = await User.findById(userId)
        if (!user) throw new UserInputError('Please login again to continue')
        const v = await Variant.deleteOne({ _id: args.id })
        await Product.updateOne(
          { _id: args.pid },
          // @ts-ignore
          { $pull: { 'variants._id': args.id } }
        )
        const p = await Product.deleteOne({ _id: args.id })
        return v.ok == 1
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    // saveVariant: async (
    //   _root,
    //   args: {
    //     pid: string
    //     id: string
    //     options: [string]
    //     stock: number
    //     weight: number
    //     barcode: string
    //     sku: string
    //     mrp: number
    //     price: number
    //     img: [string]
    //     sort: number
    //   },
    //   { req }: { req: Request }
    // ): Promise<ProductDocument | null> => {
    //   let p = await Product.findById(args.pid).select('variants')
    //   if (!p) throw new UserInputError('Product not found')

    //   args.options = JSON.parse(args.options)
    //   let v = p.variants.id(args.id)
    //   console.log('found v ', args.id, args.pid, args.options)
    //   if (!v) {
    //     p.variants.push(args)
    //     await p.save()
    //   } else {
    //     v = args
    //     p = await Product.findOneAndUpdate(
    //       { _id: args.pid, 'variants._id': args.id },
    //       {
    //         $set: {
    //           'variants.$': v,
    //           // "variants.$.stock": args.stock,
    //           // "variants.$.weight": args.weight,
    //           // "variants.$.barcode": args.barcode,
    //           // "variants.$.sku": args.sku,
    //           // "variants.$.mrp": args.mrp,
    //           // "variants.$.price": args.price,
    //           // "variants.$.img": args.img,
    //           // "variants.$.sort": args.sort,
    //         },
    //       },
    //       { new: true }
    //     )
    //   }

    //   return p
    // },
    saveVariant: async (
      root,
      args,
      { req }: { req: Request }
    ): Promise<VariantDocument | null> => {
      if (args.id == 'new') delete args.id
      const { userId } = req.session
      try {
        const variant = await Variant.findOneAndUpdate(
          { _id: args.id || Types.ObjectId() },
          { $set: { ...args, user: userId } },
          { upsert: true, new: true }
        )
        await variant.save() // To fire pre save hoook
        await Product.updateOne(
          { _id: args.pid },
          // @ts-ignore
          { $addToSet: { variants: variant._id } }
        )
        return variant
      } catch (e) {
        throw new UserInputError(e)
      }
    },
  },
}

export default resolvers
