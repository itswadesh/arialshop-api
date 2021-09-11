import { Types } from 'mongoose'
import {
  IResolvers,
  UserInputError,
  ForbiddenError,
  withFilter,
} from 'apollo-server-express'
import dayjs from 'dayjs'
import { Request, UserDocument, MediaDocument, StoreDocument } from '../types'
import { validate, mediaSchema, objectId } from '../validation'
import { Media, Product, Setting, Store, User } from '../models'
import {
  fields,
  hasSubfields,
  deleteFileFromUrlAll,
  storeToFileSystem,
  store1ToFileSystem,
} from '../utils'
import pubsub from '../pubsub'
import {
  fileUploadFromUrlS3,
  singleFileUpload,
} from '../utils/media/uploaders/awsS3'
import { CloudinaryUploader } from '../utils/media/uploaders/cloudinary'
import {
  uploadBlobsToContainer,
  createContainer,
  fileUploadFromUrlBlob,
  deleteBlobFromContainer,
} from '../utils/media/uploaders/microsoftBlob'

// const cloudinaryUploader = new CloudinaryUploader()
const MESSAGE_SENT = 'MESSAGE_SENT'
// const getStream = require('into-stream')

import { BlobServiceClient, ContainerClient } from '@azure/storage-blob'
import {
  S3_ACCESS_KEY,
  S3_BUCKET_NAME,
  S3_SECRET,
  AZURE_STORAGE_CONNECTION_STRING,
  CDN_URL,
  AZURE_STORAGE_CDN_URL,
} from '../config'

const { v1: uuidv1 } = require('uuid')

const resolvers: IResolvers = {
  Query: {
    medias: (root, args, ctx, info): Promise<MediaDocument[]> => {
      try {
        return Media.find({}, fields(info)).exec()
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    media: async (
      root,
      args: { id: string },
      ctx,
      info
    ): Promise<MediaDocument | null> => {
      try {
        await objectId.validateAsync(args)
        return Media.findById(args.id, fields(info))
      } catch (e) {
        throw new UserInputError(e)
      }
    },
  },
  Mutation: {
    //delete file from databse
    deleteFile: async (root, args, { req }: { req: Request }) => {
      try {
        return await deleteFileFromUrlAll({ url: args.url, force: true })
      } catch (e) {
        throw new UserInputError(e)
      }
    },

    createMedia: async (
      root,
      args: {
        originalFilename: string
        src: string
        path: string
        size: string
        type: string
        name: string
        use: string
        active: boolean
      },
      { req }: { req: Request }
    ): Promise<MediaDocument> => {
      await validate(mediaSchema, args)
      const { userId } = req.session
      try {
        // @ts-ignore
        const media = await Media.create({ ...args, uid: userId })
        await media.save()
        return media
      } catch (e) {
        throw new UserInputError(e)
      }
    },

    singleUpload: async (root, args, { req }: { req: Request }) => {
      let { file, folder, productId } = args
      const { userId } = req.session
      //checking store
      const settings = await Setting.findOne()
      if (!settings) throw new Error('Something went wrong')
      let store: StoreDocument = null
      if (settings.isMultiStore) {
        const user = await User.findById(userId)
        if (!user.store) throw new Error('You have not own a store')
        store = await Store.findById(user.store)
        if (!store) throw new Error('Your store does not exist')
      }

      //select folder exact path
      if (folder === 'product') {
        if (productId) {
          const product = await Product.findById(productId)
          if (!product) throw new Error('Product not exist')
          if (store) folder = `stores/${store._id}/${folder}/${product._id}`
          else folder = `${folder}/${product._id}`
        } else {
          const date = dayjs().format('YYYYMMDD')
          if (store) folder = `stores/${store._id}/${folder}/${date}`
          else folder = `${folder}/${date}`
        }
      } else {
        if (store) folder = `stores/${store._id}/${folder}`
      }
      if (settings.storageProvider == 'local') {
        const file = await store1ToFileSystem(args)
        return file
      } else if (settings.storageProvider == 's3') {
        return await singleFileUpload(null, {
          file,
          folder,
        })
      } else if (settings.storageProvider == 'azure') {
        try {
          try {
            await createContainer({ folder })
          } catch (e) {
            console.log(e.message)
          }
          return await uploadBlobsToContainer(file, folder)
        } catch (e) {
          throw new UserInputError(e)
        }
      } else {
        console.log('cloudinary selected')
      }
    },

    //Multiple file upload
    fileUpload: async (root, args, { req }: { req: Request }) => {
      let { files, folder, productId } = args
      const { userId } = req.session
      //checking store
      const settings = await Setting.findOne()
      if (!settings) throw new Error('Something went wrong')
      let store: StoreDocument = null
      if (settings.isMultiStore) {
        const user = await User.findById(userId)
        if (!user.store) throw new Error('You have not own a store')
        store = await Store.findById(user.store)
        if (!store) throw new Error('Your store does not exist')
      }
      //select folder exact path
      if (folder === 'product') {
        if (productId) {
          const product = await Product.findById(productId)
          if (!product) throw new Error('Product not exist')
          if (store) folder = `stores/${store._id}/${folder}/${product._id}`
          else folder = `${folder}/${product._id}`
        } else {
          const date = dayjs().format('YYYYMMDD')
          if (store) folder = `stores/${store._id}/${folder}/${date}`
          else folder = `${folder}/${date}`
        }
        args.folder = folder
      } else {
        if (store) folder = `stores/${store._id}/${folder}`
        args.folder = folder
      }

      if (settings.storageProvider == 'local') {
        const files = await storeToFileSystem(args)
        return files
      } else if (settings.storageProvider == 's3') {
        const res = []
        for (const file of files) {
          // console.log('file is:', file)
          const result = await singleFileUpload(null, {
            file,
            folder,
          })
          res.push(result)
        }
        // console.log(res)
        return res
      } else if (settings.storageProvider == 'azure') {
        try {
          await createContainer({ folder })
        } catch (e) {}
        const res = []
        for (const file of files) {
          // console.log('file is:', file)
          const result = await uploadBlobsToContainer(file, folder)
          res.push(result)
        }
        // console.log(res)
        return res
      } else {
        console.log('cloudinary selected')
      }
    },

    // singleUpload: s3Uploader.singleFileUploadResolver.bind(s3Uploader),
    // fileUpload: s3Uploader.multipleUploadsResolver.bind(s3Uploader),

    // singleUploadFileSystem: async (root, args, { req }: { req: Request }) => {
    //   const { userId } = req.session
    //   const file = await store1ToFileSystem(args)
    //   return file
    // },

    // fileUpload: async (root, args, { req }: { req: Request }) => {
    //   const { userId } = req.session
    //   const files = await storeToFileSystem(args)
    //   return files
    // },
  },
}

export default resolvers
