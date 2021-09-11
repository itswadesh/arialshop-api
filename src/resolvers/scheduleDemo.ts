import { IResolvers, UserInputError } from 'apollo-server-express'
import { Request, ScheduleDemoDocument } from '../types'
import { ScheduleDemo, User, Product } from '../models'
import { fields, index } from '../utils'
import { objectId } from '../validation'

const resolvers: IResolvers = {
  Query: {
    scheduleDemos: async (root, args, { req }: { req: Request }, info) => {
      args.populate = 'product products user users'
      return index({ model: ScheduleDemo, args, info })
    },
    myScheduleDemos: async (root, args, { req }: { req: Request }, info) => {
      const { userId } = req.session
      args.user = userId
      args.populate = 'product products user users'
      return index({ model: ScheduleDemo, args, info })
    },
    scheduleDemo: async (
      root,
      args: { id: string; slug: string },
      ctx,
      info
    ): Promise<ScheduleDemoDocument | null> => {
      try {
        if (args.id) {
          await objectId.validateAsync(args)
          return ScheduleDemo.findById(args.id, fields(info)).populate(
            'product products user users'
          )
        } else {
          return ScheduleDemo.findOne(
            { slug: args.slug },
            fields(info)
          ).populate('product products user users')
        }
      } catch (e) {
        throw new UserInputError(e)
      }
    },
  },

  Mutation: {
    saveScheduleDemo: async (
      root,
      args,
      { req }: { req: Request },
      info
    ): Promise<ScheduleDemoDocument | null> => {
      try {
        const { id } = args
        const { userId } = req.session
        const user = await User.findById(userId)
        if (!user) throw new UserInputError('Please login again to continue')
        let newScheduleDemo: any

        if (args.id != 'new') {
          const scheduleDemo = await ScheduleDemo.findById(args.id)
          if (!scheduleDemo)
            throw new UserInputError(`scheduleDemo with id= ${id} not found`)
          if (
            user.role !== 'admin' &&
            user.role !== 'super' &&
            scheduleDemo.user != userId
          )
            // Always use != instead of !== so that type checking is skipped
            throw new Error('This item does not belong to you')

          newScheduleDemo = await ScheduleDemo.findByIdAndUpdate(
            args.id,
            { $set: { ...args } },
            { new: true }
          )
        } else {
          const scheduleDemo = await ScheduleDemo.findOne({
            scheduleDateTime: args.scheduleDateTime,
            user: userId,
          }).collation({
            locale: 'tr',
            strength: 1,
          })
          if (scheduleDemo)
            throw new Error(
              `You have already scheduled show ${scheduleDemo.title} at this time`
            )
          newScheduleDemo = new ScheduleDemo({ ...args, user: userId })
          await Product.findByIdAndUpdate(args.product, {
            $addToSet: { scheduleDemos: newScheduleDemo._id },
          })
        }
        if (!newScheduleDemo)
          throw new UserInputError(`Error updating item id= ${id}`)
        // console.log('ScheduleDemo before save is:', newScheduleDemo)
        await newScheduleDemo.save()
        const ls = await ScheduleDemo.findById(newScheduleDemo._id).populate(
          'product products user users'
        )
        return ls
      } catch (err) {
        throw new UserInputError(err)
      }
    },
    deleteScheduleDemo: async (
      root,
      args,
      { req }: { req: Request }
    ): Promise<boolean> => {
      try {
        const result: any = await ScheduleDemo.findByIdAndDelete(args.id)
        if (result) {
          return true
        } else {
          throw new Error('ScheduleDemo does not exists ')
        }
      } catch (e) {
        throw new UserInputError(e)
      }
    },
  },
}

export default resolvers
