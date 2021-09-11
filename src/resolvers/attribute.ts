import { IResolvers, UserInputError } from 'apollo-server-express'
import { Request, AttributeDocument, CategoryDocument } from '../types'
import { validate, objectId } from '../validation'
import { Feature, User, Category, Attribute, Setting, Store } from '../models'
import { fields, index } from '../utils'
import { Types } from 'mongoose'
import * as path from 'path'
import * as csv from 'fast-csv'

const resolvers: IResolvers = {
  Query: {
    attributes: async (root, args, { req }: { req: Request }, info) => {
      const { userId } = req.session
      try {
        const user = await User.findById(userId)
        if (!user) args.active = true
        if (user && user.role != 'admin' && user.role !== 'super')
          args.active = true
        const settings = await Setting.findOne()
        if (!settings) throw new Error('Something went wrong')
        let isMultiStore = false
        if (settings.isMultiStore) isMultiStore = true
        return index({ model: Attribute, args, info, isMultiStore })
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    attribute: async (
      root,
      args: { id: string },
      ctx,
      info
    ): Promise<AttributeDocument | null> => {
      try {
        return Attribute.findById(args.id, fields(info))
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    categoryAttributes: async (
      root,
      args,
      { req }: { req: Request },
      info
    ): Promise<AttributeDocument | null> => {
      // console.log('AA', args)
      try {
        const x = await index({ model: Attribute, args, info })
        // console.log('A', x)
        //@ts-ignore
        return x
      } catch (e) {
        throw new UserInputError(e)
      }
    },
  },
  Mutation: {
    removeAttribute: async (
      root,
      args,
      { req }: { req: Request }
    ): Promise<boolean> => {
      try {
        const attribute: any = await Attribute.findByIdAndDelete(args.id)
        await Category.updateOne(
          { _id: attribute.category },
          // @ts-ignore
          { $pull: { attributes: args.id } }
        )
        if (attribute) {
          return true
        } else {
          return false
        }
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    saveAttribute: async (
      root,
      args,
      { req }: { req: Request }
    ): Promise<AttributeDocument | null> => {
      if (args.id == 'new') delete args.id
      if (args.category == 'General') args.category = null
      const { userId } = req.session
      const settings = await Setting.findOne()
      if (!settings) throw new Error('Something went wrong')
      if (settings.isMultiStore) {
        const user = await User.findById(userId)
        if (!user.store) throw new Error('You have not own a store')
        const store = await Store.findById(user.store)
        if (!store) throw new Error('Your store does not exist')
        args.store = store._id
      }
      try {
        const attribute = await Attribute.findOneAndUpdate(
          { _id: args.id || Types.ObjectId() },
          { $set: { ...args, user: userId } },
          { upsert: true, new: true }
        )
        // console.log('args are:', attribute)
        await attribute.save() // To fire pre save hoook
        if (args.category != null) {
          await Category.findByIdAndUpdate(args.category, {
            $addToSet: { attributes: attribute._id },
          })
        }
        return attribute
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    importAttribute: async (
      _root,
      args,
      { req }: { req: Request }
    ): Promise<boolean> => {
      const { userId } = req.session
      // console.log('args here:', args)
      const file = await args.file
      const { createReadStream, filename, mimetype, encoding } = file
      const { ext, name } = path.parse(filename)
      if (!filename) throw new Error('No files were uploaded.')
      else if (!filename.match(/\.(csv)$/)) {
        throw new Error('Only csv files are allowed!')
      }
      // console.log('The file is', file)
      const stream = await createReadStream()
      const results: any = []
      // console.log("the stream is:",stream)
      stream
        .pipe(csv.parse({ headers: true }))
        .on('data', (data: any) => {
          results.push(data)
        })
        .on('end', async () => {
          try {
            // console.log(results)
            file.productCount = results.length
            for (const a of results) {
              const attribute: any = {} // Never add anything extra here. It will erase that field (e.g. features)
              // if (!ObjectId.isValid(a._id) || !checkForHexRegExp.test(a._id))
              //   return
              // console.log('current attribute is: ', a)
              if (a.id) {
                a._id = a.id
              }
              if (a._id) {
                const id = a._id
              }
              if (a.name) {
                attribute.name = a.name
              }
              if (a.active) {
                attribute.active = JSON.parse(a.active.toLowerCase())
              }
              if (a.show) {
                attribute.show = JSON.parse(a.show.toLowerCase())
              }
              if (a.category) {
                const category = await Category.findOne({
                  name: a.category,
                }).collation({
                  locale: 'tr',
                  strength: 2,
                })
                if (!category) {
                  throw new Error(
                    `please enter in correct Format, attribute not exist with name: ${a.attribute}`
                  )
                } else {
                  // console.log('attribute found', attribute)
                  attribute.category = category.id
                }
              }
              //if attribute existing then attribute will update
              const attr = await Attribute.findOne({
                $or: [
                  { _id: a._id },
                  { name: a.name, category: attribute.category },
                ],
              }).collation({ locale: 'tr', strength: 1 })
              // console.log('found attribute is:', attr)
              let newAttribute: any = {}
              if (attr) {
                newAttribute = await Attribute.findByIdAndUpdate(a._id, {
                  $set: attribute,
                })
                // console.log('Updated Product : ', attribute)
              } else {
                //When new category have to create
                newAttribute = new Attribute(attribute)
                newAttribute.user = userId
                await newAttribute.save()
                await Category.findByIdAndUpdate(attribute.category, {
                  $addToSet: { attributes: newAttribute.id },
                })
              }
              // console.log('at the end')
            }
            file.attributeCount = results.length
            // console.log('flie for o/p is: ', file)
            return true
          } catch (e) {
            console.log('The error is', e)
          }
        })
      // console.log('flie for o/p is at last: ', file)
      // return file
      return true
    },
  },
}

export default resolvers
