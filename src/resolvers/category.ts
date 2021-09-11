import * as path from 'path'
import * as csv from 'fast-csv'
import { Types } from 'mongoose'
import {
  IResolvers,
  UserInputError,
  ForbiddenError,
  withFilter,
} from 'apollo-server-express'
import { Request, CategoryDocument } from '../types'
import { validate, objectId, categorySchema } from '../validation'
import {
  Attribute,
  Brand,
  Category,
  ImportDetail,
  Product,
  Setting,
  Slug,
  Store,
  User,
} from '../models'
import {
  fields,
  index,
  saveCategoryArtifacts,
  generateSlug,
  categoryPoolInProduct,
  deleteFileFromUrlAll,
  dedupeIDs,
  recurseCategory,
  importCategories,
  fileUploadFromUrlAll,
} from '../utils'
import { ObjectId } from 'mongodb'
import { IMPORT_ERROR_PREFIX } from '../config'

const resolvers: IResolvers = {
  Query: {
    categories: async (root, args, { req }: { req: Request }, info) => {
      // delete args.limit
      // delete args.page
      args.sort = args.sort || 'position'
      // args.populate = 'parent attributes'
      // const res = await Category.find(args)
      // await setCache('categories', 'megamenu', res) // Set cache
      // return { data: res, count: res.length }
      // console.log(args)
      if (args.img) {
        args.img = { $ne: null }
      }
      try {
        const settings = await Setting.findOne()
        if (!settings) throw new Error('Something went wrong')
        let isMultiStore = false
        if (settings.isMultiStore) isMultiStore = true

        const x = await index({
          model: Category,
          args,
          info,
          isMultiStore,
        })
        return x
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    categorySummary: async (root, args, { req }: { req: Request }, info) => {
      try {
        const { userId } = req.session
        //checking store
        const settings = await Setting.findOne()
        if (!settings) throw new Error('Something went wrong')
        if (settings.isMultiStore) {
          const user = await User.findById(userId)
          if (!user.store) throw new Error('You have not own a store')
          const store = await Store.findById(user.store)
          if (!store) throw new Error('Your store does not exist')
          args.store = Types.ObjectId(store._id)
        }
        const data = await Category.aggregate([
          { $match: args },
          {
            $group: {
              _id: null,
              count: { $sum: 1 },
              updatedAt: { $max: '$updatedAt' },
            },
          },
        ])
        return data[0]
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    megamenu: async (root, args, { req }: { req: Request }, info) => {
      // console.log('args.slug...', args)
      const where: any = { active: true, megamenu: true }
      where.brand = args.brand ? args.brand : null
      where.store = args.store ? args.store : null
      // The above will break for Tablez
      // const where: any = { active: true, megamenu: true, brand: args.brand }
      const where0 = { ...where }
      if (args.slug) {
        const pc = await Category.findOne({ slug: args.slug })
        // console.log('Parent category', pc)
        where0.parent = pc && pc.id
      } else where0.level = 0
      // console.log('zzzzzzzzzzzzzzzzzzzzzzzzzzz', where0)
      if (args.id) where0._id = args.id
      if (args.featured) where.featured = args.featured
      if (args.brand) where0.brand = args.brand
      const megamenu = await Category.find(where0, fields(info))
        .sort({ position: 1 })
        .populate({
          path: 'children',
          match: where,
          options: { sort: { position: 1 } },
          populate: {
            path: 'children',
            match: where,
            options: { sort: { position: 1 } },
            populate: {
              path: 'children',
              match: where,
              options: { sort: { position: 1 } },
              populate: {
                path: 'children',
                match: where,
                options: { sort: { position: 1 } },
                populate: {
                  path: 'children',
                  match: where,
                  options: { sort: { position: 1 } },
                },
              },
            },
          },
        })
      return megamenu
    },
    megamenuAll: async (root, args, { req }: { req: Request }, info) => {
      const { userId } = req.session
      const where: any = {}
      const where0 = { ...where }
      where0.level = 0
      if (args.id) where0._id = args.id
      if (args.featured) where.featured = args.featured
      //check multistore or not
      const settings = await Setting.findOne()
      if (!settings) throw new Error('Something went wrong')
      if (settings.isMultiStore) {
        const user = await User.findById(userId)
        if (!user.store) throw new Error('You have not own a store')
        const store = await Store.findById(user.store)
        if (!store) throw new Error('Your store does not exist')
        if (store) where0.store = store._id
      }

      try {
        const megamenu = await Category.find(where0, fields(info))
          .sort({ position: 1 })
          .populate({
            path: 'children',
            match: where,
            options: { sort: { position: 1 } },
            populate: {
              path: 'children',
              match: where,
              options: { sort: { position: 1 } },
              populate: {
                path: 'children',
                match: where,
                options: { sort: { position: 1 } },
                populate: {
                  path: 'children',
                  match: where,
                  options: { sort: { position: 1 } },
                  populate: {
                    path: 'children',
                    match: where,
                    options: { sort: { position: 1 } },
                    // populate: {
                    //   path: 'children',
                    //   match: where,
                    //   options: { sort: { position: 1 } },
                    //   populate: {
                    //     path: 'children',
                    //     match: where,
                    //     options: { sort: { position: 1 } },
                    //     populate: {
                    //       path: 'children',
                    //       match: where,
                    //       options: { sort: { position: 1 } },
                    //       populate: {
                    //         path: 'children',
                    //         match: where,
                    //         options: { sort: { position: 1 } },
                    //         populate: {
                    //           path: 'children',
                    //           match: where,
                    //           options: { sort: { position: 1 } },
                    //         },
                    //       },
                    //     },
                    //   },
                    // },
                  },
                },
              },
            },
          })
        return megamenu
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    category: async (
      root,
      args: { id: string; slug: string },
      ctx,
      info
    ): Promise<CategoryDocument | null> => {
      if (args.id) {
        await objectId.validateAsync(args)
        return Category.findById(args.id, fields(info)).populate(
          'parent children pathA attributes brand'
        )
      } else {
        return Category.findOne({ slug: args.slug }, fields(info)).populate(
          'parent children pathA attributes brand'
        )
      }
    },
    attributeCategories: async (
      root,
      args,
      { req }: { req: Request },
      info
    ) => {
      try {
        const result = await Category.find({
          'attributes.0': { $exists: true },
        }).populate('parent attributes')
        const general: any = {}
        general.attributes = await Attribute.find({ category: { $type: 10 } })
        general.name = 'General(No Types)'
        general.id = 'General'
        result.push(general)
        return result
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    allCategories: async (root, args, { req }: { req: Request }, info) => {
      args.limit = 10000
      args.page = 0
      args.sort = args.sort || 'position'
      try {
        const settings = await Setting.findOne()
        if (!settings) throw new Error('Something went wrong')
        let isMultiStore = false
        if (settings.isMultiStore) isMultiStore = true

        return index({ model: Category, args, info, isMultiStore })
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    categorySimple: async (
      root,
      args: { id: string; slug: string },
      ctx,
      info
    ): Promise<CategoryDocument | null> => {
      try {
        if (args.id) {
          await objectId.validateAsync(args)
          return Category.findById(args.id, fields(info))
        } else {
          return Category.findOne({ slug: args.slug }, fields(info))
        }
      } catch (e) {
        throw new UserInputError(e)
      }
    },
  },
  Mutation: {
    refreshCategorySlug: async (
      root,
      args,
      { req }: { req: Request }
    ): Promise<boolean> => {
      try {
        const categories: any = await Category.find({
          // _id: '5f733f49d2e7450c5d3f5415',
        }).sort('level') // Important so that -en not added for lower level categories
        for (const c of categories) {
          await Category.findOneAndUpdate({ _id: c._id }, c, { new: true })
          await saveCategoryArtifacts(c)
        }
        return true
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    deleteAllCategories: async (
      _root,
      args: { password: string },
      { req }: { req: Request },
      info
    ): Promise<Number> => {
      if (args.password !== 'prakash')
        throw new UserInputError('Password incorrect')
      try {
        let count = 0
        const categories = await Category.find()
        count = categories.length
        if (categories.length == 0)
          throw new Error('There is no categories for delete')

        for (const category of categories) {
          await deleteFileFromUrlAll({ url: category.img, force: true })
          await Slug.deleteOne({ slug: category.slug })
          await Category.deleteOne({ _id: category._id })
        }
        return count
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    deleteCategory: async (
      root,
      args,
      { req }: { req: Request }
    ): Promise<boolean> => {
      try {
        const category: any = await Category.findById(args.id)
        if (category && category.children && category.children.length > 0)
          throw new UserInputError('Can not delete category with children')
        if (category) {
          await deleteFileFromUrlAll({ url: category.img, force: true })
          await Slug.deleteOne({ slug: category.slug })
          await Category.updateOne(
            { _id: category.parent },
            // @ts-ignore
            { $pull: { children: category._id } }
          )
          await Category.deleteOne({ _id: category._id })
        }
        return true
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    saveCategory: async (
      root,
      args,
      { req }: { req: Request }
    ): Promise<CategoryDocument | null> => {
      const { userId } = req.session
      const refreshSlug = args.refreshSlug
      //have to apply auth that admin  or manager can create category
      const user = await User.findOne({
        _id: userId,
        role: { $in: ['super', 'admin', 'manager'] },
      })
      if (!user) throw new Error('not authorized')
      args.user = userId
      //making sure user not passed parent id and item itself same
      if (args.parent) {
        if (!ObjectId.isValid(args.parent)) {
          throw new UserInputError('parent Record not found')
        }
        if (args.id == args.parent)
          throw new Error('Parent must be different than child')
      }

      try {
        let folder = 'category'
        const settings = await Setting.findOne()
        if (!settings) throw new Error('Something went wrong')
        if (settings.isMultiStore) {
          if (!user.store) throw new Error('You have not own a store')
          const store = await Store.findById(user.store)
          if (!store) throw new Error('Your store does not exist')
          args.store = store._id
          folder = `stores/${store._id}/category`
        }

        let category: any
        if (args.id == 'new') {
          //CREATE NEW CATEGORY
          category = await Category.create(args)
          if (category.slug) {
            category.slug = await generateSlug(
              category.slug,
              'category',
              '',
              'string',
              args.store
            )
            category.refreshSlug = refreshSlug
          }
          //this part is used for img upload
          if (category.img) {
            let data = await fileUploadFromUrlAll({
              url: category.img,
              folder,
            })
            if (data) {
              if (data.url) category.img = data.url
            }
          }
          await saveCategoryArtifacts(category)
        } else {
          //in case of update category
          let slug
          if (args.slug) {
            slug = args.slug
            delete args.slug
          }
          if (!ObjectId.isValid(args.id)) {
            throw new UserInputError('Record not found')
          }
          //category before update
          const oldCategory = await Category.findById(args.id)
          if (!oldCategory) throw new UserInputError('category not exist')

          if (args.parent) {
            if (String(oldCategory.parent) !== args.parent) {
              // console.log("trying to changing parent")
              let parent = await Category.findById(args.parent)
              if (!parent) throw new UserInputError('parent not exist')
              //remove current category id from the old parent (children field)
              await Category.findOneAndUpdate(
                { _id: oldCategory.parent },
                { $pull: { children: oldCategory._id } },
                { new: true }
              )
            }
          }
          category = await Category.findByIdAndUpdate(
            args.id,
            { $set: { ...args, user: userId } },
            {
              new: true,
              upsert: true,
            }
          )
          if (slug) {
            category.slug = await generateSlug(
              slug,
              'category',
              category.slug,
              'string',
              args.store
            )
            category.refreshSlug = refreshSlug
          }
          //this part is used for img upload
          if (category.img) {
            let data = await fileUploadFromUrlAll({
              url: category.img,
              folder,
            })
            if (data) {
              if (data.url) category.img = data.url
            }
          }
          //recursive function will change its child properties
          if (args.name || args.parent || args.slug) {
            if (
              oldCategory.name != args.name ||
              oldCategory.parent != args.parent ||
              category.refreshSlug
            ) {
              await saveCategoryArtifacts(category)
            }
            // console.log("a",typeof String(oldCategory.parent),"b",typeof args.parent,"C")
            if (oldCategory.parent != args.parent) {
              await categoryPoolInProduct(category)
            }
            if (
              oldCategory.name != args.name ||
              oldCategory.parent != args.parent
            ) {
              await recurseCategory(category)
            }
          }
        }
        const updatedCategory = await Category.findById(category._id)
        return updatedCategory
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    importCategory: async (
      _root,
      args,
      { req }: { req: Request }
    ): Promise<boolean> => {
      console.log('args here:', args)
      const file = await args.file
      const { userId } = req.session
      const { createReadStream, filename, mimetype, encoding } = file
      const { ext, name } = path.parse(filename)
      if (!filename) throw new Error('No files were uploaded.')
      else if (!filename.match(/\.(csv)$/)) {
        throw new Error('Only csv files are allowed!')
      }
      const importNo =
        IMPORT_ERROR_PREFIX + Math.floor(new Date().valueOf() * Math.random())
      try {
        // console.log('The file is', file)
        const stream = await createReadStream()
        const results: any = []
        // console.log("the stream is:",stream)
        stream
          .pipe(csv.parse({ headers: true }))
          .on('data', (data: any) => {
            results.push(data)
            // console.log('da', data)
          })
          .on('end', async () => {
            //this is used for make tables for each item status(what happening with each item of csv)
            try {
              if (results.length > 2000)
                throw new Error(
                  'Only 2000 categories allowed for import at a time.'
                )
              //this is used for make tables for each item status(what happening with each item of csv)
              await importCategories(req, { file, filename, importNo, results })
              return importNo
            } catch (e) {
              throw new Error(e)
            }
          })
          .on('error', async (e) => {
            console.log('The error is', e.message)
          })
      } catch (e) {
        console.log('The error ', e)
      }
      // console.log('flie for o/p is at last: ', file)
      // return file
      return true
    },
  },
}

export default resolvers
