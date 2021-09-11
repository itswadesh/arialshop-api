import { IResolvers, UserInputError } from 'apollo-server-express'
import { Request, RoleDocument, UserDocument } from '../types'
import { validate, objectId } from '../validation'
import { User, Role } from '../models'
import { fields, index } from '../utils'
import { Types } from 'mongoose'

const resolvers: IResolvers = {
  Query: {
    roles: async (root, args, { req }: { req: Request }, info) => {
      const { userId } = req.session
      try {
        const user = await User.findById(userId)
        if (!user) args.active = true
        if (user && user.role != 'admin' && user.role !== 'super')
          args.active = true
        return index({ model: Role, args, info })
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    role: async (
      root,
      args: { id: string },
      ctx,
      info
    ): Promise<RoleDocument | null> => {
      try {
        return Role.findById(args.id, fields(info))
      } catch (e) {
        throw new UserInputError(e)
      }
    },
  },
  Mutation: {
    deleteRole: async (
      root,
      args,
      { req }: { req: Request }
    ): Promise<boolean | null> => {
      const { userId } = req.session
      try {
        const role = await Role.findById(args.id)
        if (!role) throw new UserInputError('Role not found')
        const user = await User.findById(userId)
        if (!user) throw new UserInputError('Please login again to continue')
        const s = await Role.deleteOne({ _id: args.id })
        return s.ok == 1
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    saveRole: async (
      root,
      args,
      { req }: { req: Request }
    ): Promise<RoleDocument | null> => {
      try {
        if (args.id == 'new') {
          if (!args.name)
            throw new UserInputError('Name is compulsory to create role')
          let found = await Role.findOne({ name: args.name.trim() }).collation({
            locale: 'tr',
            strength: 2,
          })
          if (found) throw new UserInputError('Role name already exists')
          delete args.id
        }
        const role = await Role.findOneAndUpdate(
          { _id: args.id || Types.ObjectId() },
          { $set: { ...args } },
          { upsert: true, new: true }
        )
        return role
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    assignRole: async (
      root,
      args,
      { req }: { req: Request }
    ): Promise<UserDocument> => {
      console.log('args', args)
      try {
        const user = await User.findById(args.userId)
        if (!user) throw new UserInputError('user not exist')
        for (let roleId of args.roleIds) {
          let role = await Role.findById(roleId)
          if (!role) throw new UserInputError('role not exist')
        }
        console.log('roleIds', args.roleIds)
        const updatedUser = await User.findOneAndUpdate(
          { _id: args.userId },
          { $set: { roles: args.roleIds } },
          { new: true }
        )
        // console.log('updatedUser', updatedUser)
        return updatedUser
      } catch (e) {
        throw new UserInputError(e)
      }
    },
  },
}

export default resolvers
