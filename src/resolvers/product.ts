import { Types } from 'mongoose'
import {
  IResolvers,
  UserInputError,
  ForbiddenError,
  withFilter,
} from 'apollo-server-express'
import {
  Request,
  UserDocument,
  ProductDocument,
  VariantDocument,
} from '../types'
import { validate, objectId, productSchema, ifImage } from '../validation'
import {
  Product,
  Variant,
  User,
  Slug,
  Category,
  Color,
  Brand,
  Attribute,
  Feature,
  Option,
  Size,
  ImportDetail,
  Setting,
  Store,
  Review,
} from '../models'
import {
  index,
  indexSub,
  fields,
  hasSubfields,
  getData,
  generateRandomString,
  saveCategoryArtifacts,
  unique,
  dedupeIDs,
  generateSlug,
  attachColor,
  esQuery,
  search,
  initMapping,
  createIndex,
  truncateFromEs,
  deleteAll,
  getStartEndDate3,
  deleteProductsFromEs,
  refreshCategoryPool,
  fileUploadFromUrlAll,
  deleteFileFromUrlAll,
  deleteProductData,
  testImportProduct,
  setImgFromImages,
  setCategoryFromCategories,
  syncFeatures,
  featuresImportProduct,
  syncProductsToES,
  syncProductAutocompletion,
  importProducts,
  checkSubscriptionProduct,
} from '../utils'

import { at } from 'lodash'
import {
  RECENT_VIEWED_PRODUCTS_LIMIT,
  CDN_URL,
  AZURE_STORAGE_CDN_URL,
  IMPORT_ERROR_PREFIX,
} from '../config'

import * as fs from 'fs'
import * as path from 'path'
import { ObjectId } from 'mongodb'
import * as csv from 'fast-csv'
import { any, array } from 'joi'
import color from '../typeDefs/color'
import size from '../typeDefs/size'
// console.log('Bucket::: ', S3_BUCKET_NAME)

const MESSAGE_SENT = 'MESSAGE_SENT'
const resolvers: IResolvers = {
  Query: {
    //just pass array of product id's
    productsByIds: (_root, args, { req }: { req: Request }, _info) => {
      try {
        return Product.find({
          _id: {
            $in: args.ids,
          },
        }).limit(10)
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    getVariant: async (_root, args, { req }: { req: Request }, _info) => {
      const options = args.options
      const pid = args.pid
      try {
        return Variant.findOne({
          pid,
          options: {
            $size: options.length,
            $all: options,
          },
        })
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    productEs: async (_root, args, { req }: { req: Request }, info) => {
      let q: any
      try {
        q = await esQuery(args.query)
        // @ts-ignore
        const data = await Product.esSearch(q)
        if (data) {
          return {
            took: data.took,
            count: data.hits.total.value,
            data: data.hits.hits,
            facets: data.aggregations,
          }
        } else return { took: 0, count: 0, data: [] }
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    productsEsTruncate: async (
      _root,
      args,
      { req }: { req: Request },
      info
    ) => {
      try {
        await deleteProductsFromEs()
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    productsSync: async (_root, args, { req }: { req: Request }, info) => {
      // try {
      //   await deleteProductsFromEs()
      // } catch (e) {
      //   throw e
      // }
      // try {
      //   await deleteAll()
      // } catch (e) {
      //   throw e
      // }

      // if (args.password !== 'prakash')
      //   throw new UserInputError('Password incorrect')
      try {
        await syncProductsToES()
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    //all the products with indexing
    products: async (_root, args, { req }: { req: Request }, info) => {
      // console.log('args are:', args)
      const { userId } = req.session
      const user = await User.findById(userId)
      if (user) {
        if (user.role === 'vendor') {
          if (!user.verified)
            throw new UserInputError(
              'You must be verified by admin to access catalogue'
            )
          args.vendor = userId
        }
      }
      args.populate = 'category brand variants store'
      args.sort = args.sort || 'position'

      try {
        // if (args.categories)
        //   args.categories = { $in: args.categories.split(',') }
        // else delete args.categories
        // if (args.stock === true) {
        //   args.stock = { $gt: 0 }
        // } else if (args.stock === false) {
        //   args.stock = { $lt: 1 }
        // } else {
        //   delete args.stock
        // }
        // if (args.type === null) delete args.type
        // console.log('aaaaaaaaaaaaaaa', args)
        //checking store
        const settings = await Setting.findOne()
        if (!settings) throw new Error('Something went wrong')
        let isMultiStore = false
        if (settings.isMultiStore) isMultiStore = true

        return index({ model: Product, args, info, isMultiStore })
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    trending: async (_root, args, { req }: { req: Request }, info) => {
      // console.log('args are:', args)
      if (args.type == 'hot') {
        args.hot = true
      } else {
        args.sale = true
      }
      args.img = { $exists: true, $ne: null }
      args.stock = { $gt: 0 }
      delete args.type
      //checking store
      const settings = await Setting.findOne()
      if (!settings) throw new Error('Something went wrong')
      if (!settings.isMultiStore) {
        delete args.store
      }

      try {
        //find products for hot or sale :true maximum 10
        let res = await Product.find(args).limit(10).skip(0)
        //if found products is <10 then find other left products randomly
        if (res.length < 10) {
          args.img = { $ne: null }
          if (args.hot) {
            args.hot = false
          } else {
            args.sale = false
          }
          let list = await Product.aggregate([
            { $match: args },
            { $sample: { size: 10 - res.length } },
          ])
          res = [...list, ...res]
        }
        res.map((item) => {
          item.id = item._id
        })
        return res
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    //it will return total count of not active products
    inactiveProducts: async (_root, args, { req }: { req: Request }, info) => {
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
          args.store = store._id
        }
        args.active = false
        let totalProducts = await Product.countDocuments()
        let inactiveProducts = await Product.find({
          ...args,
        }).countDocuments()
        // console.log('product count are', totalProducts, inactiveProducts)
        return inactiveProducts
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    popular: async (_root, args, { req }: { req: Request }, info) => {
      args.stock = { $gt: 0 }
      args.sort = '-popularity'
      args.limit = 10
      try {
        //checking store
        const settings = await Setting.findOne()
        if (!settings) throw new Error('Something went wrong')
        let isMultiStore = false
        if (settings.isMultiStore) {
          isMultiStore = true
        }
        return index({ model: Product, args, info, isMultiStore })
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    bestSellers: async (_root, _args, { req }: { req: Request }, _info) => {
      let q: any = {}
      if (req.query.daily && req.query.daily != 'null') {
        q.daily = req.query.daily
      }
      if (req.query.type && req.query.type != 'null') {
        q.type = req.query.type
      }
      // if (req.query.search) q.q = { $regex: new RegExp(req.query.search, 'ig') }
      // q.stock = { $gt: 0 }
      try {
        const { start, end } = getStartEndDate3(0)
        let t = await getData(start, end, q)
        const startEnd1 = getStartEndDate3(1)
        let t1 = await getData(startEnd1.start, startEnd1.end, q)
        const startEnd2 = getStartEndDate3(2)
        let t2 = await getData(startEnd2.start, startEnd2.end, q)
        const startEnd3 = getStartEndDate3(3)
        let t3 = await getData(startEnd3.start, startEnd3.end, q)
        const startEnd4 = getStartEndDate3(4)
        let t4 = await getData(startEnd4.start, startEnd4.end, q)
        return { t, t1, t2, t3, t4 }
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    search: (_root, args, { req }: { req: Request }, info) => {
      // if (!args.city) throw new UserInputError('Please select city')
      args.stock = { $gt: 0 }
      try {
        return index({ model: Product, args, info })
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    //products list created via logged in user(admin/vendor)
    myProducts: async (_root, args, { req }: { req: Request }, info) => {
      const { userId } = req.session
      try {
        const user = await User.findById(userId)
        if (!user) throw new Error('Please login')
        let isMultiStore = false
        if (user) {
          //role == 'super' all products
          if (user.role === 'admin') {
            //checking store
            const settings = await Setting.findOne()
            if (!settings) throw new Error('Something went wrong')
            if (settings.isMultiStore) {
              if (!user.store) throw new Error('You have not own a store')
              const store = await Store.findById(user.store)
              if (!store) throw new Error('Your store does not exist')
              args.store = store._id
              isMultiStore = true
            }
          } else if (user.role === 'vendor') {
            args.vendor = userId
          }
        }
        args.populate = 'category brand variants store'
        args.sort = args.sort || 'position'
        return index({ model: Product, args, info, isMultiStore })
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    //products list not in stock
    noStock: async (_root, args, { req }: { req: Request }, info) => {
      const { userId } = req.session
      const user = await User.findById(userId)
      if (!user) throw new Error('Please login')
      //check store
      let isMultiStore = false
      const settings = await Setting.findOne()
      if (!settings) throw new Error('Something went wrong')
      if (settings.isMultiStore) {
        if (args.store) {
          const store = await Store.findById(args.store)
          if (!store) throw new Error('Incorrect store id')
        } else {
          if (user.role !== 'super') {
            if (!user.store) throw new Error('You have not own a store')
            const store = await Store.findById(user.store)
            if (!store) throw new Error('Your store does not exist')
            args.store = store._id
          }
        }
        isMultiStore = true
      }
      args.stock = 0
      args.sort = args.sort || 'position'

      try {
        return index({ model: Product, args, info, isMultiStore })
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    //product list not have at least one image
    noImage: async (_root, args, { req }: { req: Request }, info) => {
      const { userId } = req.session
      const user = await User.findById(userId)
      if (!user) throw new Error('Please login')
      //check store
      let isMultiStore = false
      const settings = await Setting.findOne()
      if (!settings) throw new Error('Something went wrong')
      if (settings.isMultiStore) {
        if (args.store) {
          const store = await Store.findById(args.store)
          if (!store) throw new Error('Incorrect store id')
        } else {
          if (user.role !== 'super') {
            if (!user.store) throw new Error('You have not own a store')
            const store = await Store.findById(user.store)
            if (!store) throw new Error('Your store does not exist')
            args.store = store._id
          }
        }
        isMultiStore = true
      }
      args.images = []
      args.sort = args.sort || 'position'
      try {
        return index({ model: Product, args, info, isMultiStore })
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    //product list price or mrp is less than 1
    noPrice: async (_root, args, { req }: { req: Request }, info) => {
      const { userId } = req.session
      const user = await User.findById(userId)
      if (!user) throw new Error('Please login')
      //check store
      let isMultiStore = false
      const settings = await Setting.findOne()
      if (!settings) throw new Error('Something went wrong')
      if (settings.isMultiStore) {
        if (args.store) {
          const store = await Store.findById(args.store)
          if (!store) throw new Error('Incorrect store id')
        } else {
          if (user.role !== 'super') {
            if (!user.store) throw new Error('You have not own a store')
            const store = await Store.findById(user.store)
            if (!store) throw new Error('Your store does not exist')
            args.store = store._id
          }
        }
        isMultiStore = true
      }
      args.$or = [{ price: { $lt: 1 } }, { mrp: { $lt: 1 } }]
      args.sort = args.sort || 'position'
      try {
        return index({ model: Product, args, info, isMultiStore })
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    //product list price is grater than mrp
    invalidPrice: async (_root, args, { req }: { req: Request }, info) => {
      const { userId } = req.session
      const user = await User.findById(userId)
      if (!user) throw new Error('Please login')
      //check store
      const settings = await Setting.findOne()
      if (!settings) throw new Error('Something went wrong')
      if (settings.isMultiStore) {
        if (args.store) {
          const store = await Store.findById(args.store)
          if (!store) throw new Error('Incorrect store id')
        } else {
          if (user.role !== 'super') {
            if (!user.store) throw new Error('You have not own a store')
            const store = await Store.findById(user.store)
            if (!store) throw new Error('Your store does not exist')
            args.store = store._id
          }
        }
      }
      try {
        // let data: any = await Product.find({ ...args }).$where(
        //   'this.price > this.mrp'
        // )
        args.$expr = { $lt: ['$mrp', '$price'] }
        let data: any = await Product.find({ ...args })
        let count: any = data.length
        return { data, count }
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    //product list those don't have description
    noDescription: async (_root, args, { req }: { req: Request }, info) => {
      const { userId } = req.session
      const user = await User.findById(userId)
      if (!user) throw new Error('Please login')
      //check store
      let isMultiStore = false
      const settings = await Setting.findOne()
      if (!settings) throw new Error('Something went wrong')
      if (settings.isMultiStore) {
        if (args.store) {
          const store = await Store.findById(args.store)
          if (!store) throw new Error('Incorrect store id')
        } else {
          if (user.role !== 'super') {
            if (!user.store) throw new Error('You have not own a store')
            const store = await Store.findById(user.store)
            if (!store) throw new Error('Your store does not exist')
            args.store = store._id
          }
        }
        isMultiStore = true
      }
      args.description = null
      args.sort = args.sort || 'position'
      try {
        return index({ model: Product, args, info, isMultiStore })
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    invalidVendor: async (_root, args, { req }: { req: Request }, info) => {
      const { userId } = req.session
      const user = await User.findById(userId)
      if (!user) throw new Error('Please login')
      //check store
      let isMultiStore = false
      const settings = await Setting.findOne()
      if (!settings) throw new Error('Something went wrong')
      if (settings.isMultiStore) {
        if (args.store) {
          const store = await Store.findById(args.store)
          if (!store) throw new Error('Incorrect store id')
        } else {
          if (user.role !== 'super') {
            if (!user.store) throw new Error('You have not own a store')
            const store = await Store.findById(user.store)
            if (!store) throw new Error('Your store does not exist')
            args.store = store._id
          }
        }
        isMultiStore = true
      }
      args.vendor = null
      args.sort = args.sort || 'position'
      try {
        return index({ model: Product, args, info, isMultiStore })
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    //product find by slug
    productSlug: async (
      _root,
      args: { slug: string },
      _ctx,
      info
    ): Promise<ProductDocument | null> => {
      try {
        return Product.findOne({ slug: args.slug }, fields(info))
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    //product with populate data
    product: async (
      _root,
      args: { id: string },
      { req }: { req: Request },
      info
    ): Promise<ProductDocument | null> => {
      const { userId } = req.session
      try {
        await objectId.validateAsync(args)
        const prod = await Product.findById(args.id, fields(info)).populate({
          path: 'categories categoryPool collections category brand parentBrand variants vendor color size features specifications channels options productDetails relatedProducts store',
          populate: {
            path: 'pathA values size color user',
          },
        })
        let user = await User.findById(userId)
        if (prod)
          if (user) {
            let recent = user.recentlyViewed || []
            if (recent.length >= RECENT_VIEWED_PRODUCTS_LIMIT) {
              await User.findByIdAndUpdate(userId, {
                $pull: { recentlyViewed: recent[0] },
              })
            }
            await User.findByIdAndUpdate(userId, {
              $addToSet: { recentlyViewed: prod._id },
            })
          }
        return prod
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    //product without populate
    product1: async (
      _root,
      args: { id: string },
      _ctx,
      info
    ): Promise<ProductDocument | null> => {
      try {
        await objectId.validateAsync(args)
        return Product.findById(args.id, fields(info)).populate(
          'color relatedProducts productDetails specifications'
        )
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    //this is using for multiple variant logic(one master id have multiple products)
    master_id_product: (_root, args, { req }: { req: Request }, info) => {
      // console.log('args are:', args)
      args.populate = 'category brand variants'
      try {
        return index({ model: Product, args, info })
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    //give the next product of provided product id
    nextProduct: async (
      _root,
      args: { id: string },
      _ctx,
      info
    ): Promise<ProductDocument | null> => {
      try {
        await objectId.validateAsync(args)
        return Product.findOne({ _id: { $gt: args.id } }, fields(info))
          .sort({ _id: 1 })
          .limit(1)
        // .populate('categories category variants brand relatedProducts')
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    //give the previous product of provided product id
    prevProduct: async (
      _root,
      args: { id: string },
      _ctx,
      info
    ): Promise<ProductDocument | null> => {
      try {
        await objectId.validateAsync(args)
        return Product.findOne({ _id: { $lt: args.id } }, fields(info))
          .sort('-_id')
          .limit(1)
        // .populate('categories categoryPool category variants brand relatedProducts')
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    productSummary: async (_root, args, { req }: { req: Request }, _info) => {
      try {
        const { userId } = req.session
        const settings = await Setting.findOne()
        if (!settings) throw new Error('Something went wrong')
        if (settings.isMultiStore) {
          const user = await User.findById(userId)
          if (!user.store) throw new Error('You have not own a store')
          const store = await Store.findById(user.store)
          if (!store) throw new Error('Your store does not exist')
          args.store = Types.ObjectId(store._id)
        }

        let data = await Product.aggregate([
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
    //This is used for latest vaiant approach(one masterId can have multiple products)
    product_group: async (
      _root,
      args,
      { req }: { req: Request },
      info
    ): Promise<ProductDocument | {}> => {
      try {
        const product = await Product.findById(args.id)
        if (!product) throw new Error('invalid product id')
        let colorGroup: any = []
        let sizeGroup: any = []
        const productMasterId = product.productMasterId
        if (!productMasterId) return { sizeGroup, colorGroup }
        colorGroup = await Product.find({
          productMasterId,
          size: product.size,
        })
          .select('slug color stock')
          .populate('color')
        sizeGroup = await Product.find({
          productMasterId,
          color: product.color,
        })
          .select('slug size stock')
          .populate({
            path: 'size',
            // options: { sort: { sort: 1 } },
          })
        sizeGroup = sizeGroup.filter((z: any) => {
          if (z.size) return z
        })
        sizeGroup = sizeGroup.sort((a, b) =>
          +a.size.sort > +b.size.sort ? 1 : +b.size.sort > +a.size.sort ? -1 : 0
        )
        colorGroup = colorGroup.filter((z: any) => {
          if (z.color) return z
        })
        return { sizeGroup, colorGroup }
      } catch (e) {
        throw new UserInputError(e)
      }
    },
  },

  Mutation: {
    test: async () => {
      const products = await Product.find({})
      console.log(products)
      for (const p of products) {
        if (p.barcode) p.barcode = '' + p.barcode
        await p.save()
      }
      return true
    },
    //delete a single product with its field data
    deleteProduct: async (
      _root,
      args,
      { req }: { req: Request }
    ): Promise<Boolean> => {
      const { userId } = req.session
      try {
        const product = await Product.findById(args.id)
        if (!product) throw new UserInputError('Item not found')
        const user = await User.findById(userId)
        if (!user) throw new UserInputError('Please login again to continue')
        if (user.role === 'vendor' && !user.verified)
          throw new UserInputError(
            'You must be verified by admin to delete item'
          )
        if (user.role == 'admin' || product.vendor == userId) {
          //this will delete specifications, productDetails, reviews, options, variant, images, slug, and itself
          await deleteProductData(product, true)
          return true
        } else {
          throw new UserInputError('Item does not belong to you')
        }
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    //it will delete all products exists in the database
    deleteAllProducts: async (
      _root,
      args: { password: string; force: boolean },
      { req }: { req: Request },
      info
    ): Promise<Number> => {
      if (!args.force) args.force = false
      try {
        if (args.password !== 'prakash')
          throw new UserInputError('Password incorrect')

        const products = await Product.find()
        if (products.length == 0)
          throw new Error('There is no products for delete')

        for (let product of products) {
          //this will delete specifications, productDetails, reviews, options, variant, images, slug, and itself
          await deleteProductData(product, args.force)
        }
        // @ts-ignore
        await Product.synchronize()
        return products.length
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    //provide the array of product barcode for delete products
    deleteProductViaBarcode: async (
      _root,
      args,
      { req }: { req: Request },
      info
    ): Promise<Number> => {
      if (!args.force) args.force = false
      try {
        let barcodeArray = args.barcodes
        let count = 0
        for (let barcode of barcodeArray) {
          let product = await Product.findOne({ barcode })
          if (product) {
            count++
            //this will delete specifications, productDetails, reviews, options, variant, images, slug, and itself
            await deleteProductData(product, args.force)
          }
        }
        // @ts-ignore
        await Product.synchronize()
        return count
      } catch (e) {
        throw new UserInputError(e)
      }
    },

    saveProduct: async (
      _root,
      args: {
        id: string
        productMasterId: string
        name: string
        slug: string
        description: string
        type: string
        price: number
        mrp: number
        stock: number
        barcode: string
        img: string
        images: [string]
        time: string
        category: string
        categories: [string]
        collections: [string]
        brand: string
        parentBrand: string
        color: string
        colorCode: string
        colorName: string
        size: string
        styleCode: string
        cgst: string
        sgst: string
        igst: string
        tax: number
        store: string
        sizechart: string
        files: [string]
      },
      { req }: { req: Request }
    ): Promise<ProductDocument> => {
      await checkSubscriptionProduct(req)
      // console.log('args are: ', args)
      // await validate(productSchema, args) // During image removal, only img feature is passed
      const { id, barcode, colorCode, colorName, price, mrp } = args
      const { userId } = req.session
      const user = await User.findById(userId)
      if (!user) throw new UserInputError('Please login again to continue')
      //price validation
      if (price < 0 || mrp < 0) throw new UserInputError('Invalid price')
      if (price && mrp) {
        if (price > mrp)
          throw new UserInputError(
            'Price can not be greater then marketing price'
          )
      }

      //checking store
      let folder = 'product'
      const settings = await Setting.findOne()
      if (!settings) throw new Error('Something went wrong')
      if (settings.isMultiStore) {
        if (!user.store) throw new Error('You have not own a store')
        const store = await Store.findById(user.store)
        if (!store) throw new Error('Your store does not exist')
        args.store = store._id
        folder = `stores/${store._id}/product`
      }

      const regex = /^[A-Za-z0-9]+$/
      if (barcode) {
        if (!regex.test(barcode)) {
          throw new UserInputError('Barcode format is incorrect')
        }
      }
      let color
      if (colorCode) {
        color = await Color.findOne({ color_code: colorCode }).collation({
          locale: 'tr',
          strength: 2,
        })
        if (!color) {
          color = await Color.create({
            color_code: colorCode,
            name: colorName,
            store: args.store,
          })
        }
        args.color = color._id
      }
      try {
        if (user.role === 'vendor' && !user.verified)
          throw new UserInputError(
            'You must be verified by admin to update item'
          )
        const forUpdate: any =
          user.role == 'admin' || user.role == 'super'
            ? args
            : { ...args, vendor: userId }
        let newProduct: any
        // Now working............ 08-04-21
        if (args.productMasterId) {
          const checkVariant = await Product.find({
            productMasterId: args.productMasterId,
            size: args.size,
            color: args.color,
          }).countDocuments()
          if (checkVariant > 1)
            throw new Error('variant already exist in this productMasterId')
        }
        let color, size: any
        //in case of product updation
        if (args.id != 'new') {
          const product = await Product.findById(args.id).populate('size color')
          if (!product)
            throw new UserInputError(`Product with id= ${id} not found`)
          if (
            user.role !== 'admin' &&
            user.role !== 'super' &&
            product.vendor != userId
          )
            // Always use != instead of !== so that type checking is skipped
            throw new Error('This item does not belong to you')
          //price validation
          if (price && !mrp && product.mrp) {
            if (price > product.mrp)
              throw new Error('Price can not be greater then marketing price')
          }
          if (mrp && !price && product.price) {
            if (product.price > mrp)
              throw new Error('Price can not be greater then marketing price')
          }
          let slug: any //in case slug passed manually step-1
          if (args.slug) {
            slug = args.slug
            delete args.slug
          }
          if (args.productMasterId || args.styleCode)
            forUpdate.styleId = undefined

          // console.log('the updated product is:', product)
          newProduct = await Product.findOneAndUpdate(
            { _id: id },
            // @ts-ignore
            { $set: forUpdate },
            { new: true }
          ).populate('category') // If pre hook to be executed for product.save()
          //in case slug passed manually step-2
          if (slug) {
            newProduct.slug = await generateSlug(
              slug,
              'product',
              newProduct.slug,
              'string',
              args.store
            )
          } else {
            if (args.name || args.color || args.size) {
              //slug not passed
              if (newProduct.color) {
                color = await Color.findById(newProduct.color)
              }
              if (newProduct.size) {
                size = await Size.findById(newProduct.size)
              }
              if (color && size) {
                newProduct.slug = await generateSlug(
                  newProduct.name + ' ' + color.name + ' ' + size.name,
                  'product',
                  newProduct.slug,
                  'string',
                  args.store
                )
              }
              if (!color && size) {
                newProduct.slug = await generateSlug(
                  newProduct.name + ' ' + size.name,
                  'product',
                  newProduct.slug,
                  'string',
                  args.store
                )
              }
              if (color && !size) {
                newProduct.slug = await generateSlug(
                  newProduct.name + ' ' + color.name,
                  'product',
                  newProduct.slug,
                  'string',
                  args.store
                )
              }
            }
          }
          //subtract (product.images - newProduct.images)
          let deletedArray =
            product.images.filter((n) => !newProduct.images.includes(n)) || []
          if (deletedArray.length > 0)
            await deleteFileFromUrlAll({ url: deletedArray[0], force: true })
        } else {
          // CREATE NEW PRODUCT
          //in case slug passed manually
          if (args.slug) {
            args.slug = await generateSlug(
              args.slug,
              'product',
              '',
              'string',
              args.store
            )
          } else {
            if (args.color) {
              color = await Color.findById(args.color)
            }
            if (args.size) {
              size = await Size.findById(args.size)
            }
            if (color && size) {
              args.slug = await generateSlug(
                args.name + ' ' + color.name + ' ' + size.name,
                'product',
                '',
                'string',
                args.store
              )
            }
            if (!color && size) {
              args.slug = await generateSlug(
                args.name + ' ' + size.name,
                'product',
                '',
                'string',
                args.store
              )
            }
            if (color && !size) {
              args.slug = await generateSlug(
                args.name + ' ' + color.name,
                'product',
                '',
                'string',
                args.store
              )
            }
          }
          forUpdate.vendor = userId
          // console.log('AA', forUpdate)
          newProduct = new Product(forUpdate)
          // await newProduct.save()
        }
        if (!newProduct)
          throw new UserInputError(`Error updating item id= ${id}`)
        // console.log('product before save is:', newProduct)
        if (newProduct.sizechart) {
          let data = await fileUploadFromUrlAll({
            url: newProduct.sizechart,
            folder: `${folder}/${newProduct._id}/sizechart`,
          })
          if (data) {
            if (data.url) newProduct.sizechart = data.url
          }
        }
        //this part is used for img upload
        if (newProduct.img) {
          let data = await fileUploadFromUrlAll({
            url: newProduct.img,
            folder: `${folder}/${newProduct._id}`,
          })
          if (data) {
            if (data.url) newProduct.img = data.url
          }
        }
        if (newProduct.images) {
          let images = newProduct.images
          let updatedImages = []
          for (let link of images) {
            let data = await fileUploadFromUrlAll({
              url: link,
              folder: `${folder}/${newProduct._id}`,
            })
            if (data) {
              if (data.url) link = data.url
            }
            if (link != null) updatedImages.push(link)
          }
          newProduct.images = updatedImages
        }
        newProduct = await setImgFromImages(newProduct)
        newProduct = await setCategoryFromCategories(newProduct)
        //this function used for making categoryPool field based on categories field
        await refreshCategoryPool(newProduct)
        await syncProductAutocompletion(newProduct)
        await newProduct.save()
        const updatedProduct = await Product.findById(newProduct._id).populate(
          'color relatedProducts productDetails specifications'
        )
        return updatedProduct
      } catch (e) {
        throw new UserInputError(e)
      }
    },

    // saveVariant: async (
    //   root,
    //   args: {
    //     id: string
    //     name: string
    //     price: number
    //     stock: number
    //     img: string
    //   },
    //   { req }: { req: Request }
    // ): Promise<ProductDocument> => {
    //   await productValidation.validateAsync(args, { abortEarly: false })

    //   const { userId } = req.session
    //   const { id, name, price, stock, img } = args
    //   // let product = await Product.findOneAndUpdate(
    //   //   { _id: id },
    //   //   { $set: { ...args, uid: userId } }
    //   // )
    //   // if (!product) throw new UserInputError(`Product with id= ${id} not found`)

    //   // await product.save() // To fire pre save hoook

    //   // return product
    // },
    createProduct: async (
      _root,
      args: {
        name: string
        description: string
        type: string
        city: string
        price: number
        mrp: number
        stock: number
        img: string
        images: [string]
        time: string
        category: string
        brand: string
      },
      { req }: { req: Request }
    ): Promise<ProductDocument> => {
      await validate(productSchema, args)

      const { userId } = req.session
      let {
        name,
        description,
        type,
        city,
        price,
        mrp,
        stock,
        img,
        images,
        time,
        category,
        brand,
      } = args
      try {
        const user = await User.findById(userId)
        if (user.role === 'vendor' && !user.verified)
          throw new UserInputError(
            'You must be verified by admin to create item'
          )
        img = img || images[0]
        const product = new Product({
          name,
          description,
          type,
          price,
          mrp,
          stock,
          img,
          time,
          city,
          vendor: userId,
          category,
          brand,
        })
        await product.save()
        return product.populate('category brand').execPopulate()
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    importProduct: async (
      _root,
      args,
      { req }: { req: Request }
    ): Promise<String> => {
      // If SKU or Barcode is found it will update or insert if both not found
      // console.log('args here:', args)
      try {
        const file = await args.file
        const { userId } = req.session
        let { createReadStream, filename, mimetype, encoding } = file
        let { ext, name } = path.parse(filename)
        if (!filename) throw new Error('No files were uploaded.')
        else if (!filename.match(/\.(csv)$/)) {
          throw new Error('Only csv files are allowed!')
        }
        // console.log('The file is', file)
        const importNo =
          IMPORT_ERROR_PREFIX + Math.floor(new Date().valueOf() * Math.random())

        try {
          const stream = await createReadStream()
          const results: any = []
          // console.log("the stream is:",stream)
          stream
            .pipe(csv.parse({ headers: true }))
            .on('data', (data: any) => {
              // use row data
              results.push(data)
            })
            .on('end', async () => {
              try {
                // handle end of CSV
                try {
                  //this is used for make tables for each item status(what happening with each item of csv)
                  await importProducts(req, {
                    file,
                    filename,
                    importNo,
                    results,
                  })
                  return importNo
                } catch (e) {
                  throw new Error(e)
                }
              } catch (e) {
                // console.log('The error is', e)
                throw new Error(e)
              }
            })
            .on('error', async (e) => {
              // console.log('The error is', e)
              throw new Error(e)
            })
        } catch (e) {
          // console.log('The error is', e)
          throw new Error(e)
        }
        return importNo
      } catch (e) {
        // console.log('The error is', e)
        throw new Error(e)
      }
    },
    syncProductImages: async (
      _root,
      args,
      { req }: { req: Request }
    ): Promise<Number> => {
      try {
        const { userId } = req.session
        const user = await User.findById(userId).populate('roles')
        if (!user) throw new UserInputError('need to login')
        if (user.role !== 'super')
          throw new UserInputError('You need to be admin')
        //checking store
        let store
        const settings = await Setting.findOne()
        if (!settings) throw new Error('Something went wrong')
        if (settings.isMultiStore) {
          if (!user.store) throw new Error('You have not own a store')
          const store = await Store.findById(user.store)
          if (!store) throw new Error('Your store does not exist')
        }

        let products = []
        //in future we will use this approach
        // if (user.roles) {
        //   for (let r of user.roles) {
        //     if (r.name == 'super' || r.name == 'admin') {
        //       products = await Product.find()
        //     }
        //     if (r.name == 'vendor' || r.name == 'manager') {
        //       products = await Product.find({ vendor: userId })
        //     }
        //   }
        // }
        if (user.role) {
          if (user.role === 'super' || user.role === 'admin') {
            products = await Product.find()
          } else if (user.role === 'vendor' || user.role === 'manager') {
            products = await Product.find({ vendor: userId })
          }
        }
        for (let p of products) {
          let images = p.images
          let updatedImages = []
          for (let link of images) {
            let folder = `product/${p._id}`
            if (store) folder = `stores/${store._id}/product/${p._id}`
            let data = await fileUploadFromUrlAll({
              url: link,
              folder,
            })
            if (data) {
              if (data.url) link = data.url
            }
            if (link != null) updatedImages.push(link)
          }
          p.images = updatedImages
          p = await setImgFromImages(p)
        }
        return products.length
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    syncAutoComplete: async (
      _root,
      args,
      { req }: { req: Request }
    ): Promise<Number> => {
      try {
        const { userId } = req.session
        const user = await User.findById(userId).populate('roles')
        if (!user) throw new UserInputError('need to login')
        // if (user.role !== 'super')
        //   throw new UserInputError('You need to be admin')
        let products = []
        //in future we will use this approach
        // if (user.roles) {
        //   for (let r of user.roles) {
        //     if (r.name == 'super' || r.name == 'admin') {
        //       products = await Product.find()
        //     }
        //     if (r.name == 'vendor' || r.name == 'manager') {
        //       products = await Product.find({ vendor: userId })
        //     }
        //   }
        // }
        if (user.role) {
          if (user.role == 'super' || user.role == 'admin') {
            products = await Product.find()
          } else if (user.role == 'vendor' || user.role == 'manager') {
            products = await Product.find({ vendor: userId })
          }
        }
        for (let p of products) {
          await syncProductAutocompletion(p)
        }
        return products.length
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    updateAllProduct: async (
      _root,
      args,
      { req }: { req: Request }
    ): Promise<Number> => {
      try {
        const { userId } = req.session
        const user = await User.findById(userId).populate('roles')
        if (!user) throw new UserInputError('need to login')
        if (user.role !== 'super')
          throw new UserInputError('You need to be admin')
        const products = await Product.find()
        if (products.length > 0) {
          for (let product of products) {
            const forUpdate: any = { ...product }
            forUpdate.barcode = String(product.barcode)
            await Product.findOneAndUpdate(
              { _id: product._id },
              { $set: forUpdate },
              { new: true }
            )
          }
        }
        return products.length
      } catch (e) {
        throw new UserInputError(e)
      }
    },
  },

  Product: {
    vendor: async (
      product: ProductDocument,
      _args,
      _ctx,
      info
    ): Promise<UserDocument> => {
      try {
        return (await product.populate('vendor').execPopulate()).vendor
      } catch (e) {
        throw new UserInputError(e)
      }
    },
  },
}

export default resolvers
