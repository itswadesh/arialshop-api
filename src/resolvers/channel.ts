import { IResolvers, UserInputError } from 'apollo-server-express'
import { Request, ChannelDocument } from '../types'
import { Channel, User, Product } from '../models'
import {
  fetchVimeoPlaylist,
  fields,
  index,
  getNeteaseToken,
  createNeteaseChannel,
  deleteNeteaseChannel,
  createNeteaseRoom,
  getAllNeteaseTasks,
  deleteNeteaseTask,
  getAllNeteaseVideos,
} from '../utils'
// const { RtcTokenBuilder, RtcRole } = require('agora-access-token')
import * as fetch from 'node-fetch'
// import {
//   AGORA_APP_CERTIFICATE,
//   AGORA_APP_ID,
//   AGORA_CUSTOMER_ID,
//   AGORA_CUSTOMER_SECRET,
//   ZEGO_TOKEN_SERVER,
// } from '../config'
import { objectId } from '../validation'
import axios from 'axios'

const resolvers: IResolvers = {
  Query: {
    getAllStoredVideos: async (root, args, { req }: { req: Request }, info) => {
      const { userId } = req.session
      const videos = await getAllNeteaseVideos()
      videos.data = videos.list
      return videos
    },

    neteaseToken: async (root, args, { req }: { req: Request }, info) => {
      if (!args.channel) throw new UserInputError('channel not specified')
      try {
        // const oi = args.channel.split('-')
        // const orderNo = oi[0]
        // const orderItemNo = oi[1]
        // console.log('zzzzzzzzzzzzzzzzzzzzzzzzzzz', orderNo, orderItemNo)
        // const { userId } = req.session
        // const user = await User.findById(userId)
        // const {
        //   requestId,
        //   code,
        //   msg,
        //   cid,
        //   ctime,
        //   name,
        //   pushUrl,
        //   httpPullUrl,
        //   hlsPullUrl,
        //   rtmpPullUrl,
        // } = await createNeteaseChannel({
        //   channelName: args.channel,
        //   // uid: +user.phone,
        // })
        const { uid, token, appkey } = await getNeteaseToken({
          channelName: args.channel,
          // uid: +user.phone,
        })
        return {
          uid,
          token,
          appkey,
        }
        // return { uid, token, appkey }
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    zego: async (root, args, { req }: { req: Request }, info) => {
      //`eyJ2ZXIiOjEsImhhc2giOiJjNDE4ZjU2YmQ2NjlhMzkxNDM3NWMzNjIxYWNhNDIzMSIsIm5vbmNlIjoiZjFhNGYzYWRkNzhlNDcyZjhkNzg2OThlOTdlMzA4OTUiLCJleHBpcmVkIjoxNjIzMTc0NDc2fQ==`,
      // const zego = {
      //   appID: 3268197896,
      //   server: 'wss://webliveroom-hk-test.zegocloud.com/ws',
      //   roomID: 'misiki',
      //   token: '',
      //   // tokenView: `eyJ2ZXIiOjEsImhhc2giOiI2YjNlNDBhNjgxMWM0N2E1N2MwYTQ0YmE4ZDkzOTlhMyIsIm5vbmNlIjoiOTJiZDE2MjM3MmE4OTUzMGE3MTFhNTljY2MyMGMzZDUiLCJleHBpcmVkIjoxNjIzMTM4NTYzfQ==`,
      //   userID: '',
      //   userName: '',
      // }
      // const { userId } = req.session
      // const user = await User.findById(userId)
      // if (!user) throw new UserInputError('Please login again to continue')
      // zego.userID = userId
      // zego.userName = user.firstName
      // zego.token = (
      //   await axios.get(
      //     `${ZEGO_TOKEN_SERVER}/token?app_id=${zego.appID}&id_name=${zego.userID}`
      //   )
      // ).data
      // // zego.tokenView = zego.token
      // // console.log('zzzzzzzzzzzzzzzzzzzzzzzzzzz', zego.userID, zego.token)
      // return zego
    },
    zegoWhiteBoard: async (root, args, { req }: { req: Request }, info) => {
      //`eyJ2ZXIiOjEsImhhc2giOiJjNDE4ZjU2YmQ2NjlhMzkxNDM3NWMzNjIxYWNhNDIzMSIsIm5vbmNlIjoiZjFhNGYzYWRkNzhlNDcyZjhkNzg2OThlOTdlMzA4OTUiLCJleHBpcmVkIjoxNjIzMTc0NDc2fQ==`,
      // const zego = {
      //   appID: 3268197896,
      //   server: 'https://wsliveroom-alpha.zego.im:8282/token',
      //   roomID: 'misiki',
      //   token: '',
      //   // tokenView: `eyJ2ZXIiOjEsImhhc2giOiI2YjNlNDBhNjgxMWM0N2E1N2MwYTQ0YmE4ZDkzOTlhMyIsIm5vbmNlIjoiOTJiZDE2MjM3MmE4OTUzMGE3MTFhNTljY2MyMGMzZDUiLCJleHBpcmVkIjoxNjIzMTM4NTYzfQ==`,
      //   userID: '',
      //   userName: '',
      // }
      // const { userId } = req.session
      // const user = await User.findById(userId)
      // if (!user) throw new UserInputError('Please login again to continue')
      // zego.userID = userId
      // zego.userName = user.firstName
      // zego.token = (
      //   await axios.get(
      //     `${ZEGO_TOKEN_SERVER}/token?app_id=${zego.appID}&id_name=${zego.userID}`
      //   )
      // ).data
      // // zego.tokenView = zego.token
      // // console.log('zzzzzzzzzzzzzzzzzzzzzzzzzzz', zego.userID, zego.token)
      // return zego
    },
    fetchVimeo: async () => {
      const pl = await fetchVimeoPlaylist('545331344')
      return pl
    },
    channels: async (root, args, { req }: { req: Request }, info) => {
      // const { userId } = req.session
      // const user = await User.findById(userId)
      // if (user) {
      //   if (user.role == 'vendor') {
      //     if (!user.verified)
      //       throw new UserInputError(
      //         'You must be verified by admin to delete item'
      //       )
      //   }
      // }
      args.populate = 'product products user users'
      return index({ model: Channel, args, info })
    },
    myChannels: async (root, args, { req }: { req: Request }, info) => {
      const { userId } = req.session
      args.user = userId
      args.populate = 'product products user users'
      return index({ model: Channel, args, info })
    },
    channel: async (
      root,
      args: { id: string; slug: string },
      ctx,
      info
    ): Promise<ChannelDocument | null> => {
      try {
        let c: any = {}
        if (args.id) {
          await objectId.validateAsync(args)
          c = await Channel.findById(args.id, fields(info)).populate(
            'product products user users'
          )
        } else {
          c = await Channel.findOne({ slug: args.slug }, fields(info)).populate(
            'product products user users'
          )
        }
        if (c) c.hlsPullUrl = c.hlsPullUrl.replace('http://', 'https://')
        return c
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    channel1: async (
      root,
      args: { id: string; slug: string },
      ctx,
      info
    ): Promise<ChannelDocument | null> => {
      try {
        if (args.id) {
          await objectId.validateAsync(args)
          return Channel.findById(args.id, fields(info))
        } else {
          return Channel.findOne({ slug: args.slug }, fields(info))
        }
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    channelList: async (
      root,
      args,
      { req }: { req: Request }
    ): Promise<any> => {
      // try {
      //   // Customer secret
      //   const customerKey = AGORA_CUSTOMER_ID
      //   const customerSecret = AGORA_CUSTOMER_SECRET
      //   // Concatenate customer key and customer secret and use base64 to encode the concatenated string
      //   const plainCredential = customerKey + ':' + customerSecret
      //   // Encode with base64
      //   const encodedCredential =
      //     Buffer.from(plainCredential).toString('base64')
      //   const authorizationField = 'Basic ' + encodedCredential
      //   const headers = {
      //     Authorization: authorizationField,
      //     'Content-Type': 'application/json',
      //   }
      //   // @ts-ignore
      //   const response = await fetch(
      //     `https://api.agora.io/dev/v1/channel/${AGORA_APP_ID}`,
      //     { headers }
      //   )
      //   const data = await response.json()
      //   if (!data.data) return []
      //   for (const a of data.data.channels) {
      //     const user = await User.findById(a.channel_name)
      //     // console.log(user)
      //     a.user = user
      //   }
      //   // console.log(data.data.channels)
      //   return data.data.channels
      // } catch (e) {
      //   throw new UserInputError(e)
      // }
    },
  },

  Mutation: {
    pushToNeteaseCDN: async (root, args, { req }: { req: Request }, info) => {
      const { userId } = req.session
      // const room = await createNeteaseRoom({
      //   cname: args.cname,
      //   taskId: args.taskId,
      //   streamUrl: args.streamUrl,
      //   record: args.record,
      //   version: args.version,
      //   uid: userId,
      // })
      // console.log('zzzzzzzzzzzzzzzzzzzzzzzzzzz', room.cid)
      // const task = await deleteNeteaseTask({ cid: 43924721666005 })
      const task = await getAllNeteaseTasks({ cid: 43924721666005 })
      console.log(task)
    },
    saveChannel: async (
      root,
      args,
      { req }: { req: Request },
      info
    ): Promise<ChannelDocument | null> => {
      try {
        const { id } = args
        const { userId } = req.session
        const user = await User.findById(userId)
        if (!user) throw new UserInputError('Please login again to continue')

        let newChannel: any
        if (args.id != 'new') {
          const channel = await Channel.findById(args.id)
          if (!channel)
            throw new UserInputError(`channel with id= ${id} not found`)
          if (
            user.role !== 'admin' &&
            user.role !== 'super' &&
            channel.user != userId
          )
            // Always use != instead of !== so that type checking is skipped
            throw new Error('This item does not belong to you')

          newChannel = await Channel.findByIdAndUpdate(
            args.id,
            { $set: { ...args } },
            { new: true }
          )

          await Product.findOneAndUpdate(
            { _id: { $in: args.products } },
            {
              $addToSet: { channels: newChannel.id },
            }
          )
        } else {
          const channel = await Channel.findOne({
            scheduleDateTime: args.scheduleDateTime,
            user: userId,
          }).collation({
            locale: 'tr',
            strength: 1,
          })
          if (channel)
            throw new Error(
              `You have already scheduled show ${channel.title} at this time`
            )
          newChannel = new Channel({ ...args, user: userId })
          newChannel = await newChannel.save()

          await Product.findOneAndUpdate(
            { _id: { $in: args.products } },
            {
              $addToSet: { channels: newChannel.id },
            }
          )
          let data = await createNeteaseChannel({
            channelName: String(newChannel.id),
          })
          await Channel.findOneAndUpdate({ _id: newChannel.id }, data)
        }
        if (!newChannel)
          throw new UserInputError(`Error updating item id= ${id}`)
        // console.log('Channel before save is:', newChannel)
        await newChannel.save()
        const ls = await Channel.findById(newChannel._id).populate(
          'product products user users'
        )
        return ls
      } catch (err) {
        throw new UserInputError(err)
      }
    },
    deleteChannel: async (
      root,
      args,
      { req }: { req: Request }
    ): Promise<boolean> => {
      try {
        const channel: any = await Channel.findById(args.id)
        if (channel) {
          if (channel.cid) {
            try {
              await deleteNeteaseChannel({ channelId: channel.cid })
              await Channel.findByIdAndDelete(args.id)
              return true
            } catch (e) {
              console.log('the error is', e)
            }
          }
        } else {
          throw new Error('Channel does not exists ')
        }
      } catch (e) {
        throw new UserInputError(e)
      }
    },

    rtcToken: async (root, args, { req }: { req: Request }): Promise<any> => {
      // const { userId } = req.session
      // try {
      //   const user = await User.findById(userId)
      //   if (!user) throw new UserInputError('Please login again to continue')
      //   const channel = userId
      //   const role = args.isPublisher ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER
      //   const appID = AGORA_APP_ID
      //   const appCertificate = AGORA_APP_CERTIFICATE
      //   const expirationTimeInSeconds = 3600
      //   const uid = 0 //Math.floor(Math.random() * 100000).toString()
      //   const currentTimestamp = Math.floor(Date.now() / 1000)
      //   const expirationTimestamp = currentTimestamp + expirationTimeInSeconds
      //   const token = RtcTokenBuilder.buildTokenWithUid(
      //     appID,
      //     appCertificate,
      //     channel,
      //     uid,
      //     role,
      //     expirationTimestamp
      //   )
      //   return { uid, token, channel }
      // } catch (e) {
      //   throw new UserInputError(e)
      // }
    },
  },
}

export default resolvers
