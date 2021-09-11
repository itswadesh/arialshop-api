import { IResolvers, UserInputError } from 'apollo-server-express'
import { Request, StoreDocument, SubscriptionDocument } from '../types'
import { validate, objectId, storeSchema } from '../validation'
import { Store, User, Slug, Setting, Subscription } from '../models'
import {
  createDemoBanners,
  createDemoProducts,
  createSubscribe,
  deleteDemoBanners,
  deleteDemoProducts,
  deleteFileFromUrlAll,
  deleteStoreData,
  fields,
  fileUploadFromUrlAll,
  generateQRCode,
  generateSlug,
  index,
  syncStoresToES,
  setImgFromImages,
} from '../utils'
import { Types } from 'mongoose'

const resolvers: IResolvers = {
  Query: {
    stores: async (root, args, { req }: { req: Request }, info) => {
      const { userId } = req.session
      try {
        const user = await User.findById(userId)
        if (!user) args.active = true
        if (user && user.role != 'admin' && user.role !== 'super')
          args.active = true
        args.populate = 'user'
        return index({ model: Store, args, info })
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    storeOne: async (
      root,
      args: { id: string; slug: string; domain: string },
      ctx,
      info
    ): Promise<StoreDocument | null> => {
      const { id, slug, domain } = args
      if (id) {
        await objectId.validateAsync(args)
        return Store.findById(id, fields(info)).populate('user')
      } else if (domain) {
        //  const domain = new URL('http://' + host)
        // console.log('zzzzzzzzzzzzzzzzzzzzzzzzzzz', domain)
        return Store.findOne({ domain }, fields(info)).populate('user')
      } else {
        return Store.findOne({ slug }, fields(info)).populate('user')
      }
    },
    store: async (
      root,
      _,
      { req }: { req: Request },
      info
    ): Promise<StoreDocument | null> => {
      try {
        const settings = await Setting.findOne()
        const { userId } = req.session
        // let q: any = { user: userId }
        // if (!settings.isMultiStore) q = {}
        const user = await User.findById(userId)
        return Store.findOne({ _id: user.store }, fields(info))
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    syncStores: async (_root, args, { req }: { req: Request }, info) => {
      try {
        await syncStoresToES()
      } catch (e) {
        throw new UserInputError(e)
      }
    },
  },
  Mutation: {
    deleteStore: async (
      root,
      args,
      { req }: { req: Request }
    ): Promise<boolean | null> => {
      const { userId } = req.session
      try {
        const store = await Store.findById(args.id)
        if (!store) throw new UserInputError('Store not found')
        const user = await User.findById(userId)
        if (!user) throw new UserInputError('Please login again to continue')
        user.store = undefined
        if (user.role === 'vendor' && !user.verified)
          throw new UserInputError(
            'You must be verified by admin to delete store'
          )
        if (user.role == 'admin' || store.user == userId) {
          //this will delete specifications, productDetails, reviews, options, variant, images, slug, and itself
          await deleteStoreData(store, true)
          await user.save()
          return true
        } else {
          throw new UserInputError('Item does not belong to you')
        }
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    saveStore: async (
      root,
      args,
      { req }: { req: Request }
    ): Promise<StoreDocument | null> => {
      const { userId } = req.session
      delete args.id
      //check multi store enabled or not
      const settings = await Setting.findOne()
      if (!settings) throw new Error('Something went wrong')
      // if (!settings.isMultiStore) throw new Error('multi store disabled')

      //add fields from user model
      const user = await User.findById(userId)
      if (!user) throw new UserInputError('user not exist')
      if (!args.firstName) if (user.firstName) args.firstName = user.firstName
      if (!args.lastName) if (user.lastName) args.lastName = user.lastName
      if (!args.email) if (user.email) args.email = user.email
      if (!args.phone) if (user.phone) args.phone = user.phone
      let store: StoreDocument
      if (user.store) store = await Store.findById(user.store)
      let found = false
      let storeId
      if (!store) {
        //IN CASE OF CREATE NEW STORE
        if (args.refreshSlug) {
          if (args.slug) {
            args.slug = await generateSlug(
              args.slug,
              'store',
              null,
              'number',
              null
            )
          } else {
            args.slug = await generateSlug(
              args.name,
              'store',
              null,
              'number',
              null
            )
          }
        }
      } else {
        storeId = store._id
        found = true
        // UPDATE STORE
        if (args.refreshSlug) {
          if (args.slug) {
            args.slug = await generateSlug(
              args.slug,
              'store',
              store.slug,
              'number',
              null
            )
          } else {
            args.slug = await generateSlug(
              args.name,
              'store',
              store.slug,
              'number',
              null
            )
          }
        }
      }
      // await validate(storeSchema, args)
      try {
        let newStore: any = await Store.findOneAndUpdate(
          { _id: storeId || Types.ObjectId() },
          { $set: { ...args, user: userId } },
          { upsert: true, new: true }
        )
        await newStore.save() // To fire pre save hoook
        if (!found) {
          //CASE:CREATE NEW STORE
          const subscription: SubscriptionDocument = await Subscription.findOne(
            {
              name: 'FREE',
            }
          ).collation({
            locale: 'tr',
            strength: 2,
          })
          if (subscription)
            await createSubscribe(req, {
              subscriptionId: subscription._id,
            })
          newStore.qrCode = await generateQRCode(newStore)
          //file upload
        } else {
          //CASE:UPDATE EXISITNG STORE
          //subtract (product.images - newProduct.images)
          let deletedArray =
            newStore.images.filter((n) => !newStore.images.includes(n)) || []
          if (deletedArray.length > 0)
            await deleteFileFromUrlAll({ url: deletedArray[0], force: true })
          if (args.name || args.domain) {
            if (
              newStore.name !== store.name ||
              newStore.domain !== store.domain
            ) {
              newStore.qrCode = await generateQRCode(newStore)
            }
          }
        }
        //used for img upload
        if (newStore.img) {
          let data = await fileUploadFromUrlAll({
            url: newStore.img,
            folder: `stores/${newStore._id}`,
          })
          if (data) {
            if (data.url) newStore.img = data.url
          }
        }
        //images uploading
        if (newStore.images) {
          let images = newStore.images
          let updatedImages = []
          for (let link of images) {
            let data = await fileUploadFromUrlAll({
              url: link,
              folder: `stores/${newStore._id}`,
            })
            if (data) {
              if (data.url) link = data.url
            }
            if (link != null) updatedImages.push(link)
          }
          newStore.images = updatedImages
        }
        newStore = await setImgFromImages(newStore)
        //user update
        await User.findOneAndUpdate(
          { _id: userId || Types.ObjectId() },
          {
            $set: {
              role: 'admin',
              store: newStore._id,
              storeName: newStore.name,
            },
          },
          { new: true }
        )

        // console.log('the updated store is:', user)
        await newStore.save()
        return newStore
      } catch (e) {
        throw new UserInputError(e)
      }
    },

    populateDemoDataInStore: async (
      root,
      args,
      { req }: { req: Request }
    ): Promise<boolean> => {
      const { userId } = req.session
      try {
        let store: StoreDocument
        if (args.storeId) {
          store = await Store.findById(args.storeId)
        } else {
          store = await Store.findOne({ user: userId })
        }
        if (!store) throw new Error('You have not own a store')
        await createDemoProducts(store)
        await createDemoBanners(store)
        return true
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    removeDemoDataInStore: async (
      root,
      args,
      { req }: { req: Request }
    ): Promise<boolean> => {
      const { userId } = req.session
      try {
        let store: StoreDocument
        if (args.storeId) {
          store = await Store.findById(args.storeId)
        } else {
          store = await Store.findOne({ user: userId })
        }
        if (!store) throw new Error('You have not own a store')
        await deleteDemoProducts(store)
        await deleteDemoBanners(store)
        return true
      } catch (e) {
        throw new UserInputError(e)
      }
    },
  },
}

export default resolvers
