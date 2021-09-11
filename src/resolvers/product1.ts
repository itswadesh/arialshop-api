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
  AWSS3Uploader,
  fileUploadFromUrlBlob,
  attachColor,
  esQuery,
  search,
  initMapping,
  createIndex,
  truncateFromEs,
  syncToES,
  deleteAll,
  getStartEndDate3,
  deleteProductsFromEs,
  refreshCategoryPool,
  fileUploadFromUrlAll,
  deleteFileFromUrlAll,
} from '../utils'
import { at } from 'lodash'
import {
  RECENT_VIEWED_PRODUCTS_LIMIT,
  S3_ACCESS_KEY,
  S3_BUCKET_NAME,
  S3_SECRET,
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
import { ItemAssignmentList } from 'twilio/lib/rest/numbers/v2/regulatoryCompliance/bundle/itemAssignment'
import { NoUndefinedVariablesRule } from 'graphql'
// console.log('Bucket::: ', S3_BUCKET_NAME)
const s3Uploader = new AWSS3Uploader({
  accessKeyId: S3_ACCESS_KEY,
  secretAccessKey: S3_SECRET,
  destinationBucketName: S3_BUCKET_NAME,
})
const MESSAGE_SENT = 'MESSAGE_SENT'
//
const resolvers: IResolvers = {
  Query: {
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
      try {
        await syncToES()
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    products: (_root, args, { req }: { req: Request }, info) => {
      // console.log('args are:', args)
      args.populate = 'category brand variants'
      try {
        return index({ model: Product, args, info })
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    inactiveProducts: async (_root, args, { req }: { req: Request }, info) => {
      // console.log('args are:', args)
      try {
        let totalProducts = await Product.countDocuments()
        let inactiveProducts = await Product.find({
          active: false,
        }).countDocuments()
        // console.log('product count are', totalProducts, inactiveProducts)
        return inactiveProducts
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    popular: (_root, args, { req }: { req: Request }, info) => {
      args.stock = { $gt: 0 }
      args.sort = '-popularity'
      args.limit = 10
      try {
        return index({ model: Product, args, info })
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
    myProducts: (_root, args, { req }: { req: Request }, info) => {
      args.vendor = req.session.userId
      // args.populate = 'vendor'
      try {
        return index({ model: Product, args, info })
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    noStock: (_root, args, { req }: { req: Request }, info) => {
      args.stock = 0
      // args.populate = 'vendor'
      try {
        return index({ model: Product, args, info })
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    noImage: (_root, args, { req }: { req: Request }, info) => {
      args.images = []
      // args.populate = 'vendor'
      try {
        return index({ model: Product, args, info })
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    noPrice: async (_root, args, { req }: { req: Request }, info) => {
      args.$or = [{ price: { $lt: 1 } }, { mrp: { $lt: 1 } }]
      try {
        return index({ model: Product, args, info })
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    invalidPrice: async (_root, args, { req }: { req: Request }, info) => {
      try {
        let data: any = await Product.find({ $where: 'this.price > this.mrp' })
        let count: any = data.length
        return { data, count }
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    noDescription: (_root, args, { req }: { req: Request }, info) => {
      args.description = null
      try {
        return index({ model: Product, args, info })
      } catch (e) {
        throw new UserInputError(e)
      }
    },
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
          path: 'categories categoryPool category brand variants vendor color size features liveStreams options productDetails relatedProducts',
          populate: {
            path: 'pathA values size color',
          },
        })
        let user = await User.findById(userId)
        if (prod)
          if (user) {
            let recent = user.recently_viewed_products || []
            if (recent.length >= RECENT_VIEWED_PRODUCTS_LIMIT) {
              await User.findByIdAndUpdate(userId, {
                $pull: { recently_viewed_products: recent[0] },
              })
            }
            await User.findByIdAndUpdate(userId, {
              $addToSet: { recently_viewed_products: prod._id },
            })
          }
        return prod
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    product1: async (
      _root,
      args: { id: string },
      _ctx,
      info
    ): Promise<ProductDocument | null> => {
      try {
        await objectId.validateAsync(args)
        return Product.findById(args.id, fields(info))
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    master_id_product: (_root, args, { req }: { req: Request }, info) => {
      // console.log('args are:', args)
      args.populate = 'category brand variants'
      try {
        return index({ model: Product, args, info })
      } catch (e) {
        throw new UserInputError(e)
      }
    },
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
        // .populate('categories')
        // .populate('category')
        // .populate('variants')
        // .populate('brand')
      } catch (e) {
        throw new UserInputError(e)
      }
    },
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
          .populate('categories')
          .populate('categoryPool')
          .populate('category')
          .populate('variants')
          .populate('brand')
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    productSummary: async (_root, _args, { req }: { req: Request }, _info) => {
      try {
        let data = await Product.aggregate([
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
          .select('slug color')
          .populate('color')
        sizeGroup = await Product.find({
          productMasterId,
          color: product.color,
        })
          .select('slug size')
          .populate('size')
        sizeGroup = sizeGroup.filter((z: any) => {
          if (z.size) return z
        })
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
        //For features delete
        if (product.features.length > 0) {
          for (let featureId of product.features) {
            const feature = await Feature.findById(featureId)
            if (feature) feature.remove()
          }
        }
        //For option must be deleted
        if (product.options.length > 0) {
          for (let optionId of product.options) {
            const option = await Option.findById(optionId)
            if (option) option.remove()
          }
        }
        //for variants must be deleted
        if (product.variants.length > 0) {
          for (let variantId of product.variants) {
            const variant = await Variant.findById(variantId)
            if (variant) variant.remove()
          }
        }
        if (
          user.role == 'admin' ||
          user.role == 'super' ||
          product.vendor == userId
        ) {
          const doc = await Product.findById(args.id)

          if (doc) {
            await deleteFileFromUrlAll({ url: product.img })
            for (let i of product.images) {
              await deleteFileFromUrlAll({ url: i })
            }
            await Slug.deleteOne({ slug: doc.slug })
            doc.remove()
            return true
          } else {
            return false
          }
        } else {
          throw new UserInputError('Item does not belong to you')
        }
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    deleteAllProducts: async (
      _root,
      args: { password: string },
      { req }: { req: Request },
      info
    ): Promise<Boolean> => {
      try {
        if (args.password !== 'prakash')
          throw new UserInputError('Password incorrect')

        const products = await Product.find()
        if (products.length == 0)
          throw new Error('There is no products for delete')

        for (let product of products) {
          //For features delete
          if (product.features.length > 0) {
            for (let featureId of product.features)
              await Feature.findByIdAndDelete(featureId)
          }
          //For option must be deleted
          if (product.options.length > 0) {
            for (let optionId of product.options)
              await Option.findByIdAndDelete(optionId)
          }
          //for variants must be deleted
          if (product.variants.length > 0) {
            for (let variantId of product.variants)
              await Variant.findByIdAndDelete(variantId)
          }
          await Product.findByIdAndDelete(product._id)
          for (let i of product.images) {
            await deleteFileFromUrlAll({ url: i })
          }
          await Slug.deleteOne({ slug: product.slug })
        }
        // @ts-ignore
        await Product.synchronize()
        return true
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
        barcode: number
        img: string
        images: [string]
        time: string
        category: string
        categories: [string]
        brand: string
        color: string
        size: string
        cgst: string
        sgst: string
        igst: string
        tax: number
      },
      { req }: { req: Request }
    ): Promise<ProductDocument> => {
      // console.log('args are: ', args)
      // await validate(productSchema, args) // During image removal, only img feature is passed
      const { id } = args
      const { userId } = req.session
      try {
        const user = await User.findById(userId)
        if (!user) throw new UserInputError('Please login again to continue')
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
          let slug //in case slug passed manually step-1
          if (args.slug) {
            slug = args.slug
            delete args.slug
          }
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
              'string'
            )
          } else {
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
                'string'
              )
            }
            if (!color && size) {
              newProduct.slug = await generateSlug(
                newProduct.name + ' ' + size.name,
                'product',
                newProduct.slug,
                'string'
              )
            }
            if (color && !size) {
              newProduct.slug = await generateSlug(
                newProduct.name + ' ' + color.name,
                'product',
                newProduct.slug,
                'string'
              )
            }
          }

          let deletedArray =
            product.images.filter((n) => !newProduct.images.includes(n)) || []
          if (deletedArray.length > 0)
            await deleteFileFromUrlAll({ url: deletedArray[0] })
        } else {
          //in case slug passed manually
          if (args.slug) {
            args.slug = await generateSlug(args.slug, 'product', '', 'string')
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
                'string'
              )
            }
            if (!color && size) {
              args.slug = await generateSlug(
                args.name + ' ' + size.name,
                'product',
                '',
                'string'
              )
            }
            if (color && !size) {
              args.slug = await generateSlug(
                args.name + ' ' + color.name,
                'product',
                '',
                'string'
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
        //this part is used for img upload
        if (newProduct.img) {
          let data = await fileUploadFromUrlAll({
            url: newProduct.img,
            folder: 'product',
          })
          if (data) {
            if (data.url) newProduct.img = data.url
          }
        }
        const settings = await Setting.findOne()
        if (settings && settings.storageProvider == 'azure') {
          let images = newProduct.images
          let updatedImages = []
          for (let link of images) {
            let data = await fileUploadFromUrlAll({
              url: link,
              folder: 'product',
            })
            if (data) {
              if (data.url) link = data.url
            }
            if (link != null) updatedImages.push(link)
          }
          newProduct.images = updatedImages
        }
        // Logic by prakash on 07-Apr-2021
        // if (args.productMasterId) {
        //   let sizeGroup = []
        //   let colorGroup = []
        //   let products = await Product.find({
        //     productMasterId: args.productMasterId,
        //   })
        //   products = products.filter(
        //     (item) => String(item._id) !== String(newProduct._id)
        //   )
        //   let color = args.color
        //   let size = args.size

        //   if (products.length > 0) {
        //     // console.log('PP', products)
        //     for (let product of products) {
        //       if (size == String(product.size)) {
        //         // if (color != String(product.color))
        //         colorGroup.push(product._id)
        //       }
        //       if (color == String(product.color)) {
        //         // if (size != String(product.size))
        //         sizeGroup.push(product._id)
        //       }
        //     }
        //     // console.log('AA', sizeGroup, colorGroup, newProduct._id, 'PP')
        //   }
        //   newProduct.colorGroup = colorGroup
        //   newProduct.sizeGroup = sizeGroup
        // }

        //colorGroup and sizeGroup sync
        // if (args.sizeGroup.length > 0) {
        //   let arr = args.sizeGroup
        //   arr.push(newProduct._id.toString())
        //   for (let prod in args.sizeGroup) {
        //     let a = arr.shift()
        //     await Product.findByIdAndUpdate(args.sizeGroup[prod], {
        //       $set: { sizeGroup: arr },
        //     })
        //     arr.push(a)
        //   }
        // }
        // if (args.colorGroup.length > 0) {
        //   let arr = args.colorGroup
        //   arr.push(newProduct._id.toString())
        //   for (let prod in args.colorGroup) {
        //     let a = arr.shift()
        //     await Product.findByIdAndUpdate(args.colorGroup[prod], {
        //       $set: { colorGroup: arr },
        //     })
        //     arr.push(a)
        //   }
        // }

        // // Start color, size grouping
        // let colorGroup = await Product.find({
        //   productMasterId: newProduct.productMasterId,
        //   size: newProduct.size
        // }).select('slug color').populate({path: 'color', select:'name'})
        // let sizeGroup = await Product.find({
        //   productMasterId: newProduct.productMasterId,
        //   color: newProduct.color
        // }).select('slug size').populate({path: 'size', select:'name'})
        //   newProduct.colorGroup = colorGroup
        //   newProduct.sizeGroup = sizeGroup
        //   await newProduct.save()
        // // End color, size grouping

        // let products = await Product.find({
        //   productMasterId: args.productMasterId,
        // })
        // products = products.filter(
        //   (item) => String(item._id) !== String(newProduct._id)
        // )
        // if (products.length > 0) {
        //   for (let product of products) {
        //     // console.log(
        //     //   'zzzzzzzzzzzzzzzzzzzzzzzzzzz',
        //     //   product.productMasterId,
        //     //   product.size,
        //     //   product.color
        //     // )
        //     // Start color, size grouping
        //     let colorGroup = await Product.find({
        //       productMasterId: product.productMasterId,
        //       size: product.size,
        //     }).select('id')
        //     console.log('colorGroup..............', colorGroup)
        //     let sizeGroup = await Product.find({
        //       productMasterId: product.productMasterId,
        //       color: product.color,
        //     }).select('id')
        //     console.log('sizeGroup...............', sizeGroup)
        //     product.colorGroup = colorGroup
        //     product.sizeGroup = sizeGroup
        //     await product.save()
        //     // End color, size grouping
        //   }
        // }
        setImgFromImages(newProduct)
        //this function used for making categoryPool field based on categories field
        await refreshCategoryPool(newProduct)
        await newProduct.save()
        return newProduct
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
        return product.populate('category').populate('brand').execPopulate()
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
      console.log('args here:', args)
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
            // handle end of CSV
            if (results.length > 2000)
              throw new Error(
                'Only 2000 products allowed for import at a time.'
              )
            //this is used for make tables for each item status(what happening with each item of csv)
            let items: any = []
            try {
              let r = 0
              for (let item of results) {
                r++
                let msg = 'under progress'
                //check that line alloted for comment(if yes then skip this raw data)
                if (item.sku) {
                  if (item.sku.trim() == 'skip') continue
                }
                if (item.barcode) {
                  if (item.barcode.trim() == 'skip') continue
                }
                if (!item.sku && !item.barcode)
                  msg = 'barcode or sku not provide.'
                let i = {
                  importNo: importNo,
                  rawNo: r,
                  fileName: filename,
                  type: 'product',
                  message: msg,
                  user: userId,
                  data: item,
                }
                items.push(i)
              }
              items = await ImportDetail.insertMany(items)
            } catch (e) {
              console.log('error in insert details is:', e.message)
            }
            file.productCount = results.length
            let totalItems = results.length
            let raw = 0
            for (let p of results) {
              //product validation for data
              p = testProduct(p)

              try {
                let product: any = {} // Never add anything extra here. It will erase that field (e.g. features)
                // if (!ObjectId.isValid(p._id) || !checkForHexRegExp.test(p._id))
                //   return
                // console.log('current product sku and barcode are: ', p.sku, p.barcode)
                product.vendor = userId
                if (!p.sku && !p.barcode) {
                  raw = raw + 1
                  continue
                }
                //check that line alloted for comment(if yes then skip this raw data)
                if (p.sku) {
                  if (p.sku.trim() == 'skip') {
                    totalItems--
                    continue
                  }
                }
                if (p.barcode) {
                  if (p.barcode.trim() == 'skip') {
                    totalItems--
                    continue
                  }
                }
                if (p.id) {
                  p._id = p.id.trim()
                }
                if (p._id) {
                  let id = p._id.trim()
                }
                if (p.name) {
                  product.name = p.name.trim()
                }
                //old approach for specification provide as specs
                if (p.specs) {
                  let str = p.specs.split('\n\n')
                  let a = str.map((s: any) => {
                    let b = s.trim('').split('\n')
                    if (b[0] == 'SKU') p.sku = b[1]
                    if (b[0] == 'Color') p.color = b[1]
                    if (b[0] == 'Brand') p.brand = b[1]
                    if (b[0] == 'Assorted') p.assorted = b[1]
                  })
                  // console.log('specifiction is:', a)
                }
                if (p.slug) {
                  product.slug = p.slug.trim()
                }
                if (p.sku) {
                  product.sku = p.sku.trim()
                }
                if (p.barcode) {
                  product.barcode = p.barcode.trim()
                }
                if (p.description) {
                  product.description = p.description.trim()
                  if (product.description == 'DELETE')
                    product.description = undefined
                }
                if (p.type) {
                  product.type = p.type.trim()
                  if (product.type == 'DELETE') product.type = undefined
                }
                if (p.stock) {
                  product.stock = p.stock.trim()
                  if (product.stock == 'DELETE') product.stock = 0
                }
                if (p.price) {
                  let price = p.price.trim()
                  product.price = price.replace(/[^\d.-]/g, '')
                  if (product.price == 'DELETE') product.price = 0
                  // product.price = parseFloat(price1)
                  // console.log('a', price, product.price)
                }
                if (p.assorted) {
                  product.assorted = p.assorted.trim()
                  if (product.assorted == 'DELETE') product.assorted = undefined
                }
                if (p.time) {
                  product.time = p.time.trim()
                  if (product.time == 'DELETE') product.time = undefined
                }
                if (p.store) {
                  product.store = p.store.trim()
                  if (product.store == 'DELETE') product.store = undefined
                }
                if (p.metaTitle) {
                  product.metaTitle = p.metaTitle.trim()
                  if (product.metaTitle == 'DELETE')
                    product.metaTitle = undefined
                }
                if (p.metaDescription) {
                  product.metaDescription = p.metaDescription.trim()
                  if (product.metaDescription == 'DELETE')
                    product.metaDescription = undefined
                }
                if (p.metaKeywords) {
                  product.metaKeywords = p.metaKeywords.trim()
                  if (product.metaKeywords == 'DELETE')
                    product.metaKeywords = undefined
                }
                if (p.link) {
                  product.link = p.link.trim()
                  if (product.link == 'DELETE') product.link = undefined
                }
                if (p.gender) {
                  product.gender = p.gender.trim()
                  if (product.gender == 'DELETE') product.gender = undefined
                }
                if (p.createdAt) {
                  product.createdAt = p.createdAt.trim()
                  if (product.createdAt == 'DELETE')
                    product.createdAt = undefined
                }
                if (p.updatedAt) {
                  product.updatedAt = p.updatedAt.trim()
                  if (product.updatedAt == 'DELETE')
                    product.updatedAt = undefined
                }
                if (p.mrp) {
                  product.mrp = p.mrp.trim()
                  if (product.mrp == 'DELETE') product.mrp = 0
                }
                if (p.condition) {
                  product.condition = p.condition.trim()
                  if (product.condition == 'DELETE')
                    product.condition = undefined
                }
                if (p.gtin) {
                  product.gtin = p.gtin.trim()
                  if (product.gtin == 'DELETE') product.gtin = undefined
                }
                if (p.tax) {
                  product.tax = p.tax.trim()
                  if (product.tax == 'DELETE') product.tax = 0
                }
                if (p.age_min) {
                  product.ageMin = p.age_min.trim()
                  if (product.ageMin == 'DELETE') product.ageMin = undefined
                }
                if (p.age_max) {
                  product.ageMax = p.age_max.trim()
                  if (product.ageMax == 'DELETE') product.ageMax = undefined
                }
                if (p.age_unit) {
                  product.ageUnit = p.age_unit.trim()
                  if (product.ageUnit == 'DELETE') product.ageUnit = undefined
                }
                if (p.availability) {
                  product.availability = p.availability.trim()
                  if (product.availability == 'DELETE')
                    product.availability = undefined
                }
                if (p.warranty) {
                  product.warranty = p.warranty.trim()
                  if (product.warranty == 'DELETE') product.warranty = undefined
                }
                if (p.item_id) {
                  product.itemId = p.item_id.trim()
                  if (product.itemId == 'DELETE') product.itemId = undefined
                }
                if (p.style_code) {
                  product.styleCode = p.style_code.trim()
                  if (product.styleCode == 'DELETE')
                    product.styleCode = undefined
                }
                if (p.ean_no) {
                  product.eanNo = p.ean_no.trim()
                  if (product.eanNo == 'DELETE') product.eanNo = undefined
                }
                if (p.article_code) {
                  product.articleCode = p.article_code.trim()
                  if (product.articleCode == 'DELETE')
                    product.articleCode = undefined
                }
                if (p.product_master_id) {
                  product.productMasterId = p.product_master_id.trim()
                  if (product.productMasterId == 'DELETE')
                    product.productMasterId = undefined
                }
                if (p.currency) {
                  product.currency = p.currency.trim()
                  if (product.currency == 'DELETE') product.currency = undefined
                }
                if (p.manufacturer) {
                  product.manufacturer = p.manufacturer.trim()
                  if (product.manufacturer == 'DELETE')
                    product.manufacturer = undefined
                }
                if (p.hsn) {
                  product.hsn = p.hsn.trim()
                  if (product.hsn == 'DELETE') product.hsn = undefined
                }
                if (p.return_info) {
                  product.returnInfo = p.return_info.trim()
                  if (product.returnInfo == 'DELETE')
                    product.returnInfo = undefined
                }
                if (p.country_of_origin) {
                  product.countryOfOrigin = p.country_of_origin.trim()
                  if (product.countryOfOrigin == 'DELETE')
                    product.countryOfOrigin = undefined
                }
                if (p.keywords) {
                  product.keywords = p.keywords.trim()
                  if (product.keywords == 'DELETE') product.keywords = undefined
                }
                if (p.key_features) {
                  let keyFeatures = p.key_features.trim()
                  if (keyFeatures.includes('|'))
                    product.keyFeatures = keyFeatures.split('|')
                  if (keyFeatures == 'DELETE') product.keyFeatures = []
                }
                //upload img file in the azure db
                if (p.img) {
                  if (p.img == 'DELETE') {
                    product.img = undefined
                  } else {
                    let result = await fileUploadFromUrlAll({
                      url: p.img,
                      folder: 'product',
                    })
                    // console.log('the img issssssssssssssss:', p.img)
                    if (result) {
                      if (result.url) p.img = result.url
                    }
                    if (p.img == null) delete product.img
                    else product.img = p.img.trim()
                  }
                }
                if (p.images) {
                  // console.log('before', p)
                  // product.images = eval(p.images)
                  let mystring = p.images.trim()
                  // Used this regular expression to match square brackets or single quotes:
                  let b = mystring.replace(/[\[\] ']+/g, '')
                  if (b.includes(',')) product.images = b.split(',')
                  if (b == 'DELETE') product.images = []
                  // console.log('AAAA', mystring, typeof mystring, b, product.images)
                }
                //look for existing size(via: name) if not found then create one and use that
                if (p.size) {
                  if (p.size.trim() == 'DELETE') product.size = undefined
                  else {
                    // console.log('Finding Size : ', p._id, ' ', p.Size)
                    const size = await Size.findOne({
                      name: p.size.trim(),
                    }).collation({
                      locale: 'tr',
                      strength: 2,
                    })
                    if (!size) {
                      // console.log('Size not found', Size)
                      const newSize = new Size({
                        name: p.size.trim(),
                      })
                      await newSize.save()
                      product.size = newSize.id
                    } else {
                      // console.log('Size found', Size)
                      product.size = size.id
                    }
                  }
                }
                //look for color(via: color_code(reason:unique)) in existing DB ,if not found then create it and use that
                if (p.color_code) {
                  if (p.color_code.trim() == 'DELETE')
                    product.color_code = undefined
                  else {
                    // console.log('Finding Color : ', p._id, ' ', p.color)
                    const color = await Color.findOne({
                      color_code: p.color_code.trim(),
                    }).collation({
                      locale: 'tr',
                      strength: 2,
                    })

                    if (!color) {
                      // console.log('color not found', color)
                      if (p.color) {
                        const newColor = new Color({
                          name: p.color.trim(),
                          color_code: p.color_code.trim(),
                        })
                        await newColor.save()
                        product.color = newColor.id
                      }
                    } else {
                      // console.log('color found', color)
                      product.color = color.id
                    }
                  }
                }
                //look for vendor(via phone and email) in DB if not exist than create vendor and use its id
                if (p.vendor_phone || p.vendor_email) {
                  let vendorPhone
                  let vendorEmail
                  let vendorName
                  if (p.vendor_phone) vendorPhone = p.vendor_phone.trim()
                  if (p.vendor_email) vendorEmail = p.vendor_email.trim()
                  if (p.vendor_name) vendorName = p.vendor_name.trim()
                  const vendor = await User.findOne({
                    $or: [{ phone: vendorPhone }, { email: vendorEmail }],
                  }).collation({
                    locale: 'tr',
                    strength: 2,
                  })

                  if (!vendor) {
                    // console.log('vendor not found so create new one')
                    const newVendor = new User({
                      phone: vendorPhone,
                      email: vendorEmail,
                      firstName: vendorName,
                      role: 'vendor',
                    })
                    await newVendor.save()
                    product.vendor = newVendor.id
                  } else {
                    // console.log('vendor found', vendor)
                    product.vendor = vendor.id
                  }
                } else {
                  product.vendor = userId
                }

                //Old approach for category search and create category FORMAT(cat1> cate2 >cate3 > approach) via name
                if (p.category) {
                  let cate = p.category.trim()
                  if (cate == 'DELETE') product.category = undefined
                  else {
                    let c = cate.replace(/ > /g, '/') //REplace space with
                    let cateTreeList = c.split('/')
                    let currentParent: any // this is used when create category
                    let currentCategory: any
                    console.log('Before category loop..........', cateTreeList)
                    for (let i of cateTreeList) {
                      // console.log('Inside category loop..........', i)
                      let found = await Category.findOne({
                        name: i,
                        parent: currentParent,
                      }).collation({
                        locale: 'tr',
                        strength: 2,
                      })
                      if (found) {
                        // console.log('we found the category', found)
                        currentParent = found.id
                        currentCategory = found
                      } else {
                        // console.log('category not found so create the category:', i)
                        let args: any = {}
                        args.name = i
                        args.user = userId
                        if (currentParent) args.parent = currentParent
                        let newCategory = await Category.create(args) //create new categ with args
                        // console.log('category created: ', i)
                        if (newCategory) {
                          currentParent = newCategory._id
                          currentCategory = newCategory
                          await saveCategoryArtifacts(newCategory) //For slug and other things
                        }
                      }
                    }
                    product.category = currentCategory.id
                  }
                }

                //look for brand (via: brand_id (not a objectID)) in DB if not exist then create it and use it(work for brand and its parents)
                let brandList = []
                if (p.parent_brand_id && p.parent_brand) {
                  let obj = {
                    brand_id: p.parent_brand_id.trim(),
                    name: p.parent_brand.trim(),
                  }
                  brandList.push(obj)
                  if (p.brand_id && p.brand) {
                    let obj = {
                      brand_id: p.brand_id.trim(),
                      name: p.brand.trim(),
                    }
                    brandList.push(obj)
                  }
                  let currentParent: any // this is used when create brand
                  let currentBrand: any
                  // console.log('Before category loop..........', brandList)
                  for (let i of brandList) {
                    // console.log('Inside category loop..........', i)
                    let found = await Brand.findOne({
                      brand_id: i.brand_id,
                    }).collation({
                      locale: 'tr',
                      strength: 2,
                    })
                    if (found) {
                      // console.log('we found the brand', found)
                      currentParent = found.id
                      currentBrand = found
                    } else {
                      // console.log('brand not found so create the brand:', i)
                      let args: any = {}
                      args.name = i.name
                      args.brand_id = i.brand_id
                      args.user = userId
                      if (currentParent) args.parent = currentParent
                      let newBrand = await Brand.create(args) //create new categ with args
                      // console.log('Brand created: ', i)
                      if (newBrand) {
                        currentParent = newBrand._id
                        currentBrand = newBrand
                        // await saveBrandArtifacts(newBrand) //For slug and other things
                      }
                    }
                  }
                  product.brand = currentBrand.id
                }
                if (p.brand) {
                  if (p.brand.trim() == 'DELETE') product.brand = undefined
                }
                //new apporch for category with id
                //category tree create or update based in provide category_name and category_id(not objectID) ,provide seprate field for these
                let categoryList = []
                if (p.category_id1 && p.category_name1) {
                  let obj = {
                    categoryId: p.category_id1.trim(),
                    category_name: p.category_name1.trim(),
                  }
                  categoryList.push(obj)
                  if (p.category_id2 && p.category_name2) {
                    let obj = {
                      categoryId: p.category_id2.trim(),
                      category_name: p.category_name2.trim(),
                    }
                    categoryList.push(obj)
                    if (p.category_id3 && p.category_name3) {
                      let obj = {
                        categoryId: p.category_id3.trim(),
                        category_name: p.category_name3.trim(),
                      }
                      categoryList.push(obj)
                      if (p.category_id4 && p.category_name4) {
                        let obj = {
                          categoryId: p.category_id4.trim(),
                          category_name: p.category_name4.trim(),
                        }
                        categoryList.push(obj)
                        if (p.category_id5 && p.category_name5) {
                          let obj = {
                            categoryId: p.category_id5.trim(),
                            category_name: p.category_name5.trim(),
                          }
                          categoryList.push(obj)
                        }
                      }
                    }
                  }
                  let currentParent: any // this is used when create category
                  let currentCategory: any
                  // console.log('Before category loop..........', categoryList)
                  for (let i of categoryList) {
                    // console.log('Inside category loop..........', i)
                    let found = await Category.findOne({
                      categoryId: i.categoryId,
                    }).collation({
                      locale: 'tr',
                      strength: 2,
                    })
                    if (found) {
                      // console.log('we found the category', found)
                      currentParent = found.id
                      currentCategory = found
                    } else {
                      // console.log('category not found so create the category:', i)
                      let args: any = {}
                      args.name = i.category_name
                      args.categoryId = i.categoryId
                      args.user = userId
                      if (currentParent) args.parent = currentParent
                      let newCategory = await Category.create(args) //create new categ with args
                      // console.log('category created: ', i)
                      if (newCategory) {
                        currentParent = newCategory._id
                        currentCategory = newCategory
                        await saveCategoryArtifacts(newCategory) //For slug and other things
                      }
                    }
                  }
                  product.category = currentCategory.id
                }
                //in case product have multiple categories then(it will not create new category) only existing category will be added in the product
                if (p.categories) {
                  if (p.categories.includes('|')) {
                    let cate = p.categories.split('|')
                    let cateList: any = []
                    for (let category of cate) {
                      category = category.trim()
                      let found: any = await Category.findOne({
                        categoryId: category,
                      })
                      if (found) cateList.push(found._id)
                    }
                    product.categories = cateList
                  }
                  if (p.categories.trim() == 'DELETE') product.categories = []
                }
                //these are used for duplicate reason (in case value not exist), make sure find function not give the not existed field data
                if (!p.sku) {
                  p.sku = 'askjlsakldsankgdlaskj'
                }
                if (!p.barcode) {
                  p.barcode = 'askjlsakldsankgdlaskj'
                }

                //if product existing then product will update
                // console.log('product is : ', p._id, p.sku, p.barcode)
                let prod = await Product.findOne({
                  $or: [{ _id: p._id }, { sku: p.sku }, { barcode: p.barcode }],
                }).collation({ locale: 'tr', strength: 1 })
                // console.log('found product is:...', prod)
                if (p.sku == 'askjlsakldsankgdlaskj') delete p.sku
                if (p.barcode == 'askjlsakldsankgdlaskj') delete p.barcode

                let newProduct: any
                if (prod) {
                  //IF PRODUCT EXIST SO WE WILL UPDATE THE PRODUCT

                  // if (product.images) {
                  //   //For IMAGES concation

                  //   let images = mergeArray(prod.images, product.images)
                  //   let updatedImages = []
                  //   for (let link of images) {
                  //     link = link.replace(/['"]+/g, '')
                  //     if (!link.includes(CDN_URL)) {
                  //       link = (
                  //         await s3Uploader.fileUploadFromUrl({
                  //           url: link,
                  //           folder: 'products',
                  //         })
                  //       ).url
                  //       updatedImages.push(link)
                  //     }
                  //   }
                  //   if (updatedImages == null) delete product.images
                  //   else product.images = updatedImages
                  // }

                  // console.log('the updated product is:', prod.id)
                  newProduct = await Product.findOneAndUpdate(
                    { _id: prod.id },
                    { $set: product },
                    { new: true }
                  )
                  // console.log('Updated Product : ', prod, newProduct)
                  // setImgFromImages(newProduct)
                  await newProduct.save()
                  await refreshCategoryPool(newProduct)
                  await featuresImportProduct(newProduct, p, userId)
                  await specificationsImportProduct(newProduct, p, userId)
                  //call for model importDetail which is responsible for what happened with product
                  await ImportDetail.findByIdAndUpdate(items[raw].id, {
                    $set: {
                      message: 'Product already exist, so product updated',
                      totalItems: totalItems,
                      success: true,
                    },
                  })
                } else {
                  //CREATE NEW PRODUCT
                  // if (product.images) {
                  //For IMAGES concation
                  // let images = product.images
                  // let updatedImages = []
                  // for (let link of images) {
                  //   link = link.replace(/['"]+/g, '')
                  //     let result = await fileUploadFromUrlAll({
                  //         url: link,
                  //         folder: 'product',
                  //       })
                  //   if (result) {
                  //       if(result.url) link = result.url
                  //     }
                  //     if (result != null) updatedImages.push(link)
                  // }
                  //   product.images = updatedImages
                  // }
                  newProduct = new Product(product)
                  await newProduct.save()
                  setImgFromImages(newProduct)
                  await refreshCategoryPool(newProduct)
                  // console.log('Saved Product : ', p._id, ' p: ', p)
                  await featuresImportProduct(newProduct, p, userId)
                  await specificationsImportProduct(newProduct, p, userId)
                  //call for model importDetail which is responsible for what happened with product
                  await ImportDetail.findByIdAndUpdate(items[raw].id, {
                    $set: {
                      message: 'New Product Created',
                      totalItems: totalItems,
                      success: true,
                    },
                  })
                }
              } catch (e) {
                //in case somthing wrong in the product csv import ,it will show that what happened with each raw data
                // console.log('error in import product ', e.message,e)
                await ImportDetail.findByIdAndUpdate(items[raw].id, {
                  $set: {
                    message: e.message,
                    totalItems: totalItems,
                    success: false,
                  },
                })
              }
              // console.log('at the end')
              raw += 1
            }
            // console.log('flie for o/p is: ', file)
            //img upoa
            // if (product.images) {
            //For IMAGES concation
            // let images = product.images
            // let updatedImages = []
            // for (let link of images) {
            //   link = link.replace(/['"]+/g, '')
            //     let result = await fileUploadFromUrlAll({
            //         url: link,
            //         folder: 'product',
            //       })
            //   if (result) {
            //       if(result.url) link = result.url
            //     }
            //     if (result != null) updatedImages.push(link)
            // }
            //   product.images = updatedImages
            // }

            return importNo
          })
      } catch (e) {
        console.log('The error is', e)
      }
      // console.log('flie for o/p is at last: ', file)
      // return file
      return importNo
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

const mergeArray = (arr1: any, arr2: any) => {
  //arr1 is responsible for exist prodcut images
  //arr2 is responsible for receviced images from the import productible
  //arr4 is responsible for merge array(join)
  let arr4 = [...new Set([...arr1, ...arr2])]

  // console.log('LL', arr1, arr2, arr5)
  return arr4
}
//
//this function used for select img from images field
const setImgFromImages = async (product: any) => {
  // console.log('calling the setImgFromImages and product is:', product)
  let images = product.images
  const img = product.img
  if (img == null) {
    // console.log('img null so I am choosing from images[0]')
    if (typeof images == 'string') {
      images = [images]
    }
    if (images == undefined) {
      images = []
    }
    if (images.length > 0) product.img = images[0]
  }

  if (!images.includes(img)) {
    // console.log('img not in the images array so img choose from images[0]')
    if (images.length > 0) product.img = images[0]
  }
  if (images.length == 0) {
    product.img = undefined
    //   // console.log('images lengths is 0 so img also be null ')
  }
  // console.log('product before update is:', product)
  await Product.findByIdAndUpdate(product._id, { $set: product }, { new: true })
}

//old approach like - (features.name1,features.name2)
async function featuresImportProduct(newProduct: any, p: any, userId: String) {
  // console.log( 'Saved or updated Product : ', newProduct )
  //This is for product features
  for (let a in p) {
    if (a.includes('features.')) {
      let fName, fValue: any
      if (a) fName = a.trim().split('.')[1]
      if (p[a]) fValue = p[a].trim().toLowerCase()
      if (fValue) {
        let attr: any = {}
        attr.name = fName
        attr.category = newProduct.category
        attr.show = true

        //check attributes in category ,then create or update them(like if attribute Show is false htne make it true)
        let newAttribute = await Attribute.findOneAndUpdate(
          { name: fName, category: newProduct.category },
          { $set: { ...attr, user: userId } },
          { upsert: true, new: true }
        ).collation({
          locale: 'tr',
          strength: 2,
        })
        await newAttribute.save() // To fire pre save hoook
        let c: any = await Category.findById(attr.category)
        c.attributes.push(newAttribute._id)
        c.attributes = dedupeIDs(c.attributes)
        await c.save()

        // check feature exist in current product or not
        let feature: any = await Feature.findOne({
          product: newProduct._id,
          name: fName,
        }).collation({
          locale: 'tr',
          strength: 2,
        })
        //If we found the feature
        if (feature) {
          //if feature
          // console.log('after search feature in the product', feature)
          if (feature.value.includes(fValue) == false) {
            feature.value = feature.value + ',' + fValue
            feature.user = userId
            await Feature.findByIdAndUpdate(
              feature.id,
              { $set: { ...feature } },
              { upsert: true, new: true }
            )
          }
        } else {
          //feature not found so create it in the product
          let newFeature = new Feature({
            name: fName,
            value: fValue,
            product: newProduct.id,
            user: userId,
          })
          await newFeature.save()
          await Product.findByIdAndUpdate(
            newProduct.id,
            {
              $addToSet: { features: newFeature.id },
            },
            { new: true }
          )
        }
      }
    }
  }
}

async function specificationsImportProduct(
  newProduct: any,
  p: any,
  userId: String
) {
  if (p.product_specifications) {
    let specifictions: any = []
    if (p.product_specifications.includes('|')) {
      specifictions = p.product_specifications.split('|')
    } else {
      specifictions.push(p.product_specifications)
    }
    if (specifictions.length > 0) {
      for (let specs of specifictions) {
        // console.log('s', specs.split('::'))
        let feature, fName, fValue: any
        if (specs) feature = specs.trim().split('::')
        if (feature) {
          if (feature[0]) fName = feature[0].trim()
          if (feature[1]) fValue = feature[1].trim().toLowerCase()
        } // console.log(
        //   'features properties is: ',
        //   fName,
        //   fValue,
        //   newProduct.category
        // )
        if (fValue) {
          let attr: any = {}
          attr.name = fName
          attr.category = newProduct.category
          attr.show = true

          //check attributes in category ,then create or update them(like if attribute Show is false htne make it true)
          let newAttribute = await Attribute.findOneAndUpdate(
            { name: fName, category: newProduct.category },
            { $set: { ...attr, user: userId } },
            { upsert: true, new: true }
          ).collation({
            locale: 'tr',
            strength: 2,
          })
          await newAttribute.save() // To fire pre save hoook
          let c: any = await Category.findById(attr.category)
          c.attributes.push(newAttribute._id)
          c.attributes = dedupeIDs(c.attributes)
          await c.save()

          // check feature exist in current product or not
          let feature: any = await Feature.findOne({
            product: newProduct._id,
            name: fName,
          }).collation({
            locale: 'tr',
            strength: 2,
          })
          //If we found the feature
          if (feature) {
            //if feature
            // console.log('after search feature in the product', feature)
            if (feature.value.includes(fValue) == false) {
              feature.value = feature.value + ',' + fValue
              feature.user = userId
              await Feature.findByIdAndUpdate(
                feature.id,
                { $set: { ...feature } },
                { upsert: true, new: true }
              )
            }
          } else {
            //feature not found so create it in the product
            let newFeature = new Feature({
              name: fName,
              value: fValue,
              product: newProduct.id,
              user: userId,
              type: 'specification',
            })
            await newFeature.save()
            await Product.findByIdAndUpdate(
              newProduct.id,
              {
                $addToSet: { features: newFeature.id },
              },
              { new: true }
            )
          }
        }
      }
    }
  }
  if (p.product_details) {
    let productDetails: any = []
    if (p.product_details.includes('|')) {
      productDetails = p.product_details.split('|')
    } else {
      productDetails.push(p.product_details)
    }
    if (productDetails.length > 0) {
      for (let details of productDetails) {
        // console.log('s', details.split('::'))
        let feature, fName, fValue: any
        if (details) feature = details.trim().split('::')
        if (feature) {
          if (feature[0]) fName = feature[0].trim()
          if (feature[1]) fValue = feature[1].trim().toLowerCase()
        }
        // console.log(
        //   'features properties is: ',
        //   fName,
        //   fValue,
        //   newProduct.category
        // )
        if (fValue) {
          let attr: any = {}
          attr.name = fName
          attr.category = newProduct.category
          attr.show = true

          //check attributes in category ,then create or update them(like if attribute Show is false htne make it true)
          let newAttribute = await Attribute.findOneAndUpdate(
            { name: fName, category: newProduct.category },
            { $set: { ...attr, user: userId } },
            { upsert: true, new: true }
          ).collation({
            locale: 'tr',
            strength: 2,
          })
          await newAttribute.save() // To fire pre save hoook
          let c: any = await Category.findById(attr.category)
          c.attributes.push(newAttribute._id)
          c.attributes = dedupeIDs(c.attributes)
          await c.save()

          // check feature exist in current product or not
          let feature: any = await Feature.findOne({
            product: newProduct._id,
            name: fName,
            type: 'details',
          }).collation({
            locale: 'tr',
            strength: 2,
          })
          //If we found the feature
          if (feature) {
            //if feature
            // console.log('after search feature in the product', feature)
            if (feature.value.includes(fValue) == false) {
              feature.value = feature.value + ',' + fValue
              feature.user = userId
              await Feature.findByIdAndUpdate(
                feature.id,
                { $set: { ...feature } },
                { upsert: true, new: true }
              )
            }
          } else {
            //feature not found so create it in the product
            let newFeature = new Feature({
              name: fName,
              value: fValue,
              product: newProduct.id,
              user: userId,
            })
            await newFeature.save()
            await Product.findByIdAndUpdate(
              newProduct.id,
              {
                $addToSet: { productDetails: newFeature.id },
              },
              { new: true }
            )
          }
        }
      }
    }
  }
}

const testProduct = (p: any) => {
  let product = { ...p }
  for (let a in product) {
    if (product[a].includes('undefined' || 'null')) {
      delete product[a]
    }
    if (product[a] == undefined || null) {
      delete product[a]
    }
  }
  return product
}

export default resolvers

// export const upload = async () => {
//   try {
//     const docs = await Litekart.find({ banner: { $exists: false } }).select(
//       'slug original_image'
//     )
//     const uploadPromises = docs.map(async (d: any) => {
//       const filename =
//         d.slug + '-' + Math.floor(new Date().valueOf() * Math.random())
//       console.log('Upload started... ', ${directory}/${filename})
//       try {
//         const c = await cloudinary.uploader.upload(d.original_image, {
//           public_id: ${directory}/${filename},
//         })
//         d.banner = IMAGE_CDN + c.public_id
//         await d.save()
//         console.log('Upload success... ', ${directory}/${filename})
//       } catch (e) {
//         console.log('Upload err at lib...', e)
//       }
//     })
//     return Promise.all(uploadPromises)
//   } catch (e) {
//     throw e
//   }
// }
