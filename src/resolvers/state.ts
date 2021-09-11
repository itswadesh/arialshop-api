import { Types } from 'mongoose'
import {
  IResolvers,
  UserInputError,
  ForbiddenError,
  withFilter,
} from 'apollo-server-express'
import { Request, UserDocument, StateDocument } from '../types'
import { validate, stateSchema, objectId } from '../validation'
import { State, Slug } from '../models'
import { fields, hasSubfields, index, generateSlug } from '../utils'

const resolvers: IResolvers = {
  Query: {
    states: (root, args, { req }: { req: Request }, info) => {
      try {
        return index({ model: State, args, info })
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    state: async (
      root,
      args: { id: string; slug: string },
      ctx,
      info
    ): Promise<StateDocument | null> => {
      try {
        if (args.id) {
          await objectId.validateAsync(args)
          return State.findById(args.id, fields(info))
        } else {
          return State.findOne({ slug: args.slug }, fields(info))
        }
      } catch (e) {
        throw new UserInputError(e)
      }
    },
  },
  Mutation: {
    deleteState: async (
      root,
      args,
      { req }: { req: Request }
    ): Promise<boolean> => {
      try {
        const state: any = await State.findByIdAndDelete(args.id)
        if (state) {
          await Slug.deleteOne({ slug: state.slug })
          return true
        } else {
          return false
        }
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    saveState: async (
      root,
      args,
      { req }: { req: Request }
    ): Promise<StateDocument | null> => {
      const { userId } = req.session
      try {
        if (args.id == 'new') {
          const state = await State.findOne({ name: args.name }).collation({
            locale: 'tr',
            strength: 1,
          })
          if (state)
            throw new Error(
              'state already existed,can not create new state with same name'
            )
          return await State.create(args)
        } else {
          const state = await State.findOneAndUpdate(
            { _id: args.id },
            { ...args, user: userId },
            { new: true, upsert: true }
          )
          // console.log('the updated state is:', state)
          await state.save() // To fire pre save hoook
          return state
        }
      } catch (e) {
        throw new UserInputError(e)
      }
    },
  },
}

export default resolvers
