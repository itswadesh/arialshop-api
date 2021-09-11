const fs = require('fs')
import decode from 'urldecode'
import { Types } from 'mongoose'
import { fields, index } from '../utils'
import {
  IResolvers,
  UserInputError,
  ForbiddenError,
  withFilter,
} from 'apollo-server-express'
import {
  Request,
  UserDocument,
  EmailTemplateDocument,
  SettingsDocument,
} from '../types'
import { EmailTemplate, Setting, Store, User } from '../models'
import { STATIC_PATH, WWW_URL } from '../config'
var Readable = require('stream').Readable
import { createUploadStream } from '../utils/media/uploaders/awsS3'
import { fileUploadToAzureBlob } from '../utils/media/uploaders/microsoftBlob'

const resolvers: IResolvers = {
  Query: {
    emailTemplates: async (root, args, { req }: { req: Request }, info) => {
      const { userId } = req.session
      try {
        // const result: any = await fs.readFileSync(
        //   `${STATIC_PATH}/templates/${args.folder}/${args.name}.hbs`,
        //   'utf8'
        // )
        // if (!result) throw new UserInputError('Page not found')
        // else return result
        const user = await User.findById(userId)
        if (!user) args.active = true
        if (user && user.role != 'admin' && user.role !== 'super')
          args.active = true
        args.populate = 'user store'
        //checking store
        const settings = await Setting.findOne()
        if (!settings) throw new Error('Something went wrong')
        let isMultiStore = false
        if (settings.isMultiStore) isMultiStore = true

        return index({ model: EmailTemplate, args, info, isMultiStore })
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    emailTemplate: async (
      root,
      args: { id: string },
      ctx,
      info
    ): Promise<EmailTemplateDocument | null> => {
      try {
        // const result: any = await fs.readFileSync(
        //   `${STATIC_PATH}/templates/${args.name}.hbs`,
        //   'utf8'
        // )
        // if (!result) throw new UserInputError('Page not found')
        // else return result
        return EmailTemplate.findById(args.id, fields(info)).populate(
          'user store'
        )
      } catch (e) {
        throw new UserInputError(e)
      }
    },
  },
  Mutation: {
    deleteEmailTemplate: async (
      root,
      args,
      { req }: { req: Request }
    ): Promise<boolean | null> => {
      const { userId } = req.session
      try {
        const emailTemplate = await EmailTemplate.findById(args.id)
        if (!emailTemplate) throw new UserInputError('EmailTemplate not found')
        const user = await User.findById(userId)
        if (!user) throw new UserInputError('Please login again to continue')
        const s = await EmailTemplate.deleteOne({ _id: args.id })
        return s.ok == 1
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    saveEmailTemplate: async (
      root,
      args,
      { req }: { req: Request }
    ): Promise<EmailTemplateDocument> => {
      const { userId } = req.session
      try {
        //checking store
        const settings = await Setting.findOne()
        if (!settings) throw new Error('Something went wrong')
        let subFolder = null
        if (settings.isMultiStore) {
          const user = await User.findById(userId)
          if (!user.store) throw new Error('You have not own a store')
          const store = await Store.findById(user.store)
          if (!store) throw new Error('Your store does not exist')
          args.store = store._id
          subFolder = `stores/${store._id}`
        }
        if (args.id == 'new') {
          let found = await EmailTemplate.findOne({
            name: args.name.trim(),
          }).collation({
            locale: 'tr',
            strength: 2,
          })
          if (found)
            throw new UserInputError('EmailTemplate name already exists')
          delete args.id
        }
        if (args.content) {
          const settings: SettingsDocument | null =
            await Setting.findOne().exec()
          if (!settings) throw new UserInputError('Invalid store configuration')
          let result
          if (settings.storageProvider == 'local') {
            console.log('email template uploading locally')
            fs.writeFileSync(
              `${STATIC_PATH}/templates/${args.name}.hbs`,
              args.content,
              'utf8'
            )
            let result = `${WWW_URL}/assets/templates/${args.name.replace(
              /\s+/g,
              ''
            )}.hbs`

            if (subFolder) {
              result = `${WWW_URL}/assets/${subFolder}/templates/${args.name.replace(
                /\s+/g,
                ''
              )}.hbs`
            }
          } else if (settings.storageProvider == 's3') {
            console.log('sending to s3')
            let stream = new Readable()
            stream.push(args.content) // the string you want
            stream.push(null) // indicates end-of-file basically - the end of the stream
            const mimetype = 'text/html'
            const folder = 'templates'
            let filePath =
              folder + '/' + args.name.replace(/\s+/g, '') + '.html'
            if (subFolder) {
              filePath =
                subFolder +
                '/' +
                folder +
                '/' +
                args.name.replace(/\s+/g, '') +
                '.html'
            }

            const uploadStream = await createUploadStream(filePath, mimetype)
            //@ts-ignore
            stream.pipe(uploadStream.writeStream)
            try {
              const res = await uploadStream.promise
              result = res.Location
            } catch (e) {
              console.log('utils/s3.ts Err:::109 ', e.toString())
            }
          } else if (settings.storageProvider == 'azure') {
            console.log('sending to azure storge')
            let stream = new Readable()
            stream.push(args.content) // the string you want
            stream.push(null) // indicates end-of-file basically - the end of the stream
            let folder = 'templates'
            if (subFolder) folder = `${subFolder}/templates`

            result = await fileUploadToAzureBlob(
              stream,
              args.name.replace(/\s+/g, '') + '.html',
              'templates'
            )
          } else {
            console.log('cloudinary selected')
          }
          if (result) args.link = decode(result)
        }
        const emailTemplate = await EmailTemplate.findOneAndUpdate(
          { _id: args.id || Types.ObjectId() },
          { $set: { ...args, user: userId } },
          { upsert: true, new: true }
        )
        return emailTemplate
      } catch (e) {
        throw new UserInputError(e)
      }
    },
  },
}

export default resolvers
