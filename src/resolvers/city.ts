import { IResolvers, UserInputError } from 'apollo-server-express'
import { Request, CityDocument } from '../types'
import { validate, objectId, couponSchema } from '../validation'
import { City, User, Slug } from '../models'
import { fields, index, generateSlug } from '../utils'
import { Types } from 'mongoose'

const resolvers: IResolvers = {
  Query: {
    cities: async (root, args, { req }: { req: Request }, info) => {
      const { userId } = req.session
      try {
        const user = await User.findById(userId)
        if (!user) args.active = true
        if (user && user.role != 'admin' && user.role !== 'super')
          args.active = true
        args.populate = 'user'
        return index({ model: City, args, info })
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    city: async (
      root,
      args: { id: string },
      ctx,
      info
    ): Promise<CityDocument | null> => {
      try {
        return City.findById(args.id, fields(info)).populate('user')
      } catch (e) {
        throw new UserInputError(e)
      }
    },
  },
  Mutation: {
    removeCity: async (
      root,
      args,
      { req }: { req: Request }
    ): Promise<boolean> => {
      const { userId } = req.session
      try {
        const city = await City.findById(args.id)
        if (!city) throw new UserInputError('City not found')
        const user = await User.findById(userId)
        if (!user) throw new UserInputError('Please login again to continue')
        if (
          user.role != 'admin' &&
          user.role !== 'super' &&
          city.user == userId
        )
          throw new UserInputError('City does not belong to you')
        await Slug.deleteOne({ slug: city.slug })
        const c = await City.deleteOne({ _id: args.id })
        return c.ok == 1
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    saveCity: async (
      root,
      args,
      { req }: { req: Request }
    ): Promise<CityDocument | null> => {
      if (args.id == 'new') delete args.id
      const { userId } = req.session
      try {
        const city = await City.findOneAndUpdate(
          { _id: args.id || Types.ObjectId() },
          { $set: { ...args, user: userId } },
          { upsert: true, new: true }
        ).populate('user')
        // console.log('the updated city is:', city)
        await city.save() // To fire pre save hoook
        return city
      } catch (e) {
        throw new UserInputError(e)
      }
    },
  },
}

export default resolvers
