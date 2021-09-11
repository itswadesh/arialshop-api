import { IResolvers, UserInputError } from 'apollo-server-express'
import { Request, BlogDocument } from '../types'
import { Blog, Setting, Slug, Store, User } from '../models'
import { fields, index, generateSlug, deleteFileFromS3 } from '../utils'

const resolvers: IResolvers = {
  Query: {
    blogs: async (root, args, { req }: { req: Request }, info) => {
      try {
        args.populate = 'user store'
        const settings = await Setting.findOne()
        if (!settings) throw new Error('Something went wrong')
        let isMultiStore = false
        if (settings.isMultiStore) isMultiStore = true

        return index({ model: Blog, args, info, isMultiStore })
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    blog: async (
      root,
      args: { id: string },
      ctx,
      info
    ): Promise<BlogDocument | null> => {
      try {
        return Blog.findById(args.id, fields(info)).populate('user store')
      } catch (e) {
        throw new UserInputError(e)
      }
    },
  },
  Mutation: {
    deleteBlog: async (
      root,
      args,
      { req }: { req: Request }
    ): Promise<boolean> => {
      try {
        const blog: any = await Blog.findByIdAndDelete(args.id)
        if (blog) {
          await deleteFileFromS3(blog.img)
          await Slug.deleteOne({ slug: blog.slug })
          return true
        } else {
          return false
        }
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    saveBlog: async (
      root,
      args,
      { req }: { req: Request }
    ): Promise<BlogDocument | null> => {
      // console.log('Args are in saveBlog are:', args)
      const { userId } = req.session
      try {
        const settings = await Setting.findOne()
        if (!settings) throw new Error('Something went wrong')
        if (settings.isMultiStore) {
          const user = await User.findById(userId)
          if (!user.store) throw new Error('You have not own a store')
          const store = await Store.findById(user.store)
          if (!store) throw new Error('Your store does not exist')
          args.store = store._id
        }
        if (args.id == 'new') {
          if (args.slug)
            args.slug = await generateSlug(
              args.slug,
              'blog',
              '',
              'string',
              args.store
            )
          args.user = userId
          return await Blog.create(args)
        } else {
          let slug
          if (args.slug) {
            slug = args.slug
            delete args.slug
          }
          const blog = await Blog.findOneAndUpdate(
            { _id: args.id },
            { ...args, user: userId },
            { new: true, upsert: true }
          )
          // console.log('the updated blog is:', blog)
          if (slug)
            blog.slug = await generateSlug(
              slug,
              'blog',
              blog.slug,
              'string',
              args.store
            )
          // console.log('the updated blog is:', blog)
          await blog.save() // To fire pre save hoook
          return blog
        }
      } catch (e) {
        throw new UserInputError(e)
      }
    },
  },
}

export default resolvers
