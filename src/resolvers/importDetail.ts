import {
  IResolvers,
  UserInputError,
  AuthenticationError,
} from 'apollo-server-express'
import { Request, Response, ImportDetailDocument } from '../types'
import { ImportDetail, User, Product } from '../models'
import { fields, index, generateSlug } from '../utils'

const resolvers: IResolvers = {
  Query: {
    importDetails: async (root, args, { req }: { req: Request }, info) => {
      const { userId } = req.session
      args.user = userId
      try {
        return index({ model: ImportDetail, args, info })
      } catch (e) {
        throw new UserInputError(e)
      }
    },
  },

  Mutation: {
    deleteImportDetails: async (
      root,
      args,
      { req }: { req: Request }
    ): Promise<number> => {
      const { userId } = req.session
      try {
        const data = await ImportDetail.find({
          type: args.type,
          user: userId,
        })
        for (const item of data) await ImportDetail.findByIdAndDelete(item.id)
        return data.length
      } catch (e) {
        throw new Error('unable to delete please try after some time')
      }
    },
  },
}

export default resolvers
