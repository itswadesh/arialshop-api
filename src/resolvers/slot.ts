import { Types } from 'mongoose'
import {
  IResolvers,
  UserInputError,
  ForbiddenError,
  withFilter,
} from 'apollo-server-express'
import { Request, SlotDocument } from '../types'
import { validate, objectId } from '../validation'
import { Slot, User, Setting, Slug, Store } from '../models'
import { fields, hasSubfields, index, generateSlug } from '../utils'
import { slotSchema } from '../validation/slot'

const resolvers: IResolvers = {
  Query: {
    slots: async (root, args, { req }: { req: Request }, info) => {
      try {
        //checking store
        const settings = await Setting.findOne()
        if (!settings) throw new Error('Something went wrong')
        let isMultiStore = false
        if (settings.isMultiStore) {
          isMultiStore = true
          args.populate = 'store'
        }
        return index({ model: Slot, args, info, isMultiStore })
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    slot: async (
      root,
      args: { id: string },
      ctx,
      info
    ): Promise<SlotDocument | null> => {
      try {
        await objectId.validateAsync(args)
        return Slot.findById(args.id, fields(info)).populate('store')
      } catch (e) {
        throw new UserInputError(e)
      }
    },
  },
  Mutation: {
    removeSlot: async (
      root,
      args,
      { req }: { req: Request }
    ): Promise<boolean | null> => {
      const { userId } = req.session
      try {
        const slot = await Slot.findById(args.id)
        if (!slot) throw new UserInputError('Slot not found')
        const user = await User.findById(userId)
        if (!user) throw new UserInputError('Please login again to continue')
        await Slug.deleteOne({ slug: slot.slug })
        const s = await Slot.deleteOne({ _id: args.id })
        return s.ok == 1
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    //THIS SAVE SLOT IS USED FOR DELIVER THE PACKAGE ON SLOT
    saveSlot: async (
      root,
      args,
      { req }: { req: Request }
    ): Promise<SlotDocument | null> => {
      const { userId } = req.session
      try {
        //checking store
        const settings = await Setting.findOne()
        if (!settings) throw new Error('Something went wrong')
        if (settings.isMultiStore) {
          const user = await User.findById(userId)
          if (!user.store) throw new Error('You have not own a store')
          const store = await Store.findById(user.store)
          if (!store) throw new Error('Your store does not exist')
          args.store = store._id
        }
        if (args.id == 'new') return await Slot.create(args)
        else {
          const slot = await Slot.findOneAndUpdate(
            { _id: args.id },
            { ...args, uid: userId },
            { new: true, upsert: true }
          )
          // console.log('the updated slot is:', slot)
          await slot.save() // To fire pre save hoook
          return slot
        }
      } catch (e) {
        throw new UserInputError(e)
      }
    },
  },
}

export default resolvers
