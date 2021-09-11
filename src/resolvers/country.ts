import { Types } from 'mongoose'
import {
  IResolvers,
  UserInputError,
  ForbiddenError,
  withFilter,
} from 'apollo-server-express'
import { Request, UserDocument, CountryDocument } from '../types'
import { validate, countrySchema, objectId } from '../validation'
import { Country, Slug } from '../models'
import { fields, hasSubfields, index, generateSlug } from '../utils'

const resolvers: IResolvers = {
  Query: {
    countries: (root, args, { req }: { req: Request }, info) => {
      try {
        return index({ model: Country, args, info })
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    country: async (
      root,
      args: { id: string; slug: string },
      ctx,
      info
    ): Promise<CountryDocument | null> => {
      try {
        if (args.id) {
          await objectId.validateAsync(args)
          return Country.findById(args.id, fields(info))
        } else {
          return Country.findOne({ slug: args.slug }, fields(info))
        }
      } catch (e) {
        throw new UserInputError(e)
      }
    },
  },
  Mutation: {
    deleteCountry: async (
      root,
      args,
      { req }: { req: Request }
    ): Promise<boolean> => {
      try {
        const country: any = await Country.findByIdAndDelete(args.id)
        if (country) {
          await Slug.deleteOne({ slug: country.slug })
          return true
        } else {
          return false
        }
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    saveCountry: async (
      root,
      args,
      { req }: { req: Request }
    ): Promise<CountryDocument | null> => {
      const { userId } = req.session
      try {
        if (args.id == 'new') {
          const country = await Country.findOne({ name: args.name }).collation({
            locale: 'tr',
            strength: 1,
          })
          if (country)
            throw new Error(
              'country already existed,can not create new country with same name'
            )
          return await Country.create(args)
        } else {
          const country = await Country.findOneAndUpdate(
            { _id: args.id },
            { ...args, user: userId },
            { new: true, upsert: true }
          )
          // console.log('the updated country is:', country)
          await country.save() // To fire pre save hoook
          return country
        }
      } catch (e) {
        throw new UserInputError(e)
      }
    },
  },
}

export default resolvers
