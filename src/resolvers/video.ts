import { Types } from 'mongoose'
import {
  IResolvers,
  UserInputError,
  ForbiddenError,
  withFilter,
} from 'apollo-server-express'
import { Request, UserDocument, VideoDocument } from '../types'
import { validate, objectId } from '../validation'
import { Video, Slug, User } from '../models'
import { fields, hasSubfields, index, generateSlug } from '../utils'

const resolvers: IResolvers = {
  Query: {
    videosByIds: (_root, args, { req }: { req: Request }, _info) => {
      try {
        return Video.find({
          _id: {
            $in: args.ids,
          },
        })
          .limit(10)
          .populate('user')
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    myVideos: async (root, args, { req }: { req: Request }, info) => {
      const { userId } = req.session
      try {
        const user = await User.findById(userId)
        if (user && user.role !== 'admin' && user.role !== 'super')
          args.user = userId
        return index({ model: Video, args, info })
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    videos: async (root, args, { req }: { req: Request }, info) => {
      args.populate = 'user'
      try {
        return index({ model: Video, args, info })
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    video: async (
      root,
      args: { id: string; slug: string },
      ctx,
      info
    ): Promise<VideoDocument | null> => {
      try {
        await Video.findByIdAndUpdate(args.id, { $inc: { views: 1 } })
        if (args.id) {
          await objectId.validateAsync(args)
          return Video.findById(args.id, fields(info)).populate({
            path: 'user',
          })
        } else {
          return Video.findOne({ slug: args.slug }, fields(info)).populate({
            path: 'user',
          })
        }
      } catch (e) {
        throw new UserInputError(e)
      }
    },
  },
  Mutation: {
    deleteVideo: async (
      root,
      args,
      { req }: { req: Request }
    ): Promise<boolean> => {
      try {
        const video: any = await Video.findByIdAndDelete(args.id)
        if (video) {
          await Slug.deleteOne({ slug: video.slug })
          return true
        } else {
          return false
        }
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    saveVideo: async (
      root,
      args,
      { req }: { req: Request }
    ): Promise<VideoDocument | null> => {
      const { userId } = req.session
      args.user = userId
      try {
        if (args.id == 'new') return Video.create(args)
        else {
          const video = await Video.findOneAndUpdate({ _id: args.id }, args, {
            new: true,
            upsert: true,
          }).populate({
            path: 'user',
          })
          // console.log('the updated video is:', video)
          return video.save() // To fire pre save hoook
        }
      } catch (e) {
        throw new UserInputError(e)
      }
    },
  },
}

export default resolvers
