import { Types } from 'mongoose'
import {
  IResolvers,
  UserInputError,
  ForbiddenError,
  withFilter,
} from 'apollo-server-express'
import { Request, AddressDocument, UserDocument } from '../types'
import { validate, addressSchema, objectId } from '../validation'
import { Address, Setting, Store, User } from '../models'
import {
  fields,
  hasSubfields,
  index,
  insertServiceBusQueue,
  getServiceBusQueue,
  getLocationFromZipServiceBusHook,
  getCoordinatesFromZipServiceBusHook,
  getLocationServiceBusHook,
} from '../utils'
import pubsub from '../pubsub'
import axios from 'axios'
const MESSAGE_SENT = 'MESSAGE_SENT'
import distance from 'google-distance'
import {
  GOOGLE_MAPS_KEY,
  LOCATION_ZIP_QUEUE_NAME,
  CORD_ZIP_QUEUE_NAME,
  LOCATION_QUEUE_NAME,
} from '../config'

const resolvers: IResolvers = {
  Query: {
    getLocationFromZip: async (root, args, ctx, info) => {
      try {
        //serviceBus
        await getLocationFromZipServiceBusHook(args.zip)
        const res = (
          await axios.get(`https://api.postalpincode.in/pincode/${args.zip}`)
        ).data[0]
        const r = res.PostOffice[0]
        if (r) {
          return {
            zip: args.zip,
            city: r.Block,
            state: r.State,
            country: r.Country,
          }
        }
        return {}
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    getCoordinatesFromZip: async (root, args, ctx, info) => {
      try {
        //serviceBus
        await getCoordinatesFromZipServiceBusHook(args.zip)
        const res = (
          await axios.get(
            `https://maps.googleapis.com/maps/api/geocode/json?key=${GOOGLE_MAPS_KEY}&components=postal_code:${args.zip}`
          )
        ).data.results[0]
        const r = res.geometry.location
        if (r) {
          return {
            lat: r.lat,
            lng: r.lng,
          }
        }
        return {}
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    getLocation: async (root, args, ctx, info) => {
      try {
        //serviceBus
        await getLocationServiceBusHook({ lat: args.lat, lng: args.lng })

        const res = await axios.get(
          // `https://api.mapbox.com/geocoding/v5/mapbox.places/${args.lat},${args.lng}.json?access_token=${MAPBOX_KEY}`
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${args.lat},${args.lng}&sensor=true&key=${GOOGLE_MAPS_KEY}`
        )
        if (res.data.results.length < 1)
          throw new UserInputError(res.data.error_message)
        const l = {
          city: null,
          district: null,
          state: null,
          country: null,
          zip: null,
        }
        const result = res.data.results[0]
        if (result) {
          const c = result.address_components
          const len = c.length
          l.zip = c[len - 1].long_name
          l.country = c[len - 2].long_name
          l.state = c[len - 3].long_name
          l.district = c[len - 4].long_name
          l.city = c[len - 5].long_name
        }
        return l
      } catch (e) {
        if (e && e.response && e.response.data && e.response.data.error_message)
          throw new UserInputError(e.response.data.error_message)
        else throw new UserInputError(e)
      }
    },
    addresses: async (root, args, { req }: { req: Request }, info) => {
      try {
        const settings = await Setting.findOne()
        if (!settings) throw new Error('Something went wrong')
        let isMultiStore = false
        if (settings.isMultiStore) isMultiStore = true
        return index({ model: Address, args, info, isMultiStore })
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    myAddresses: (root, args, { req }: { req: Request }, info) => {
      try {
        const { userId } = req.session
        args.user = userId
        return index({ model: Address, args, info })
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    address: async (
      root,
      args: { id: string },
      ctx,
      info
    ): Promise<AddressDocument | null> => {
      try {
        await objectId.validateAsync(args)
        return Address.findById(args.id, fields(info))
      } catch (e) {
        throw new UserInputError(e)
      }
    },

    getNearbyVendors: async (
      root,
      args,
      { req }: { req: Request },
      info
    ): Promise<any> => {
      const { userId } = req.session
      const shortestDistance = 0
      distance.apiKey = GOOGLE_MAPS_KEY
      try {
        //this will return user with one address which is active
        const userWithAddress = await User.findById(userId).populate({
          path: 'address',
          match: { active: true },
        })
        const userAddress = userWithAddress.address[0]
        // POINT1      // let origin = `${userAddress.address},${userAddress.city},${userAddress.district},${userAddress.state},${userAddress.country} `
        // console.log('USER_LOCATION: ', origin)
        const origin_lat = userAddress.coords.lat
        const origin_lng = userAddress.coords.lng

        const vendorsAddress = await Address.find().populate({
          path: 'user',
          match: { role: 'vendor' },
        })
        // console.log(vendorsAddress)

        vendorsAddress.map(async (element) => {
          if (element.user != null && element.active == true) {
            // let destinations_lat = element.coords.lat
            // let destinations_lng = element.coords.lng
            // let response2 = await axios.get(
            //   `https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=${origin_lat},${origin_lng}&destinations=${destinations_lat},${destinations_lng}&key=${GOOGLE_MAPS_KEY}`
            // )
            // console.log(response2.data.rows[0].elements[0])
          }
        })
      } catch (e) {
        throw new UserInputError(e)
      }
    },
  },

  Mutation: {
    addAddress: async (
      root,
      args: {
        // email: string
        firstName: string
        lastName: string
        address: string
        town: string
        district: string
        city: string
        country: string
        state: string
        zip: string
        phone: string
        coords: { lat: number; lng: number }
        store: string
      },
      { req }: { req: Request }
    ): Promise<AddressDocument> => {
      // await validate(addressSchema, args)
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
        const newAddress = new Address({ ...args, user: userId })
        //make sure only one addres will be active
        await Address.updateMany({ user: userId }, { $set: { active: false } })
        await newAddress.save()
        await User.updateOne(
          { _id: userId },
          // @ts-ignore
          { $addToSet: { address: newAddress._id } }
        )
        // const address = await Address.create({ ...args, user: userId })
        // await address.save()
        return newAddress
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    saveAddress: async (
      root,
      args,
      { req }: { req: Request }
    ): Promise<AddressDocument | null> => {
      const { userId } = req.session
      args.user = userId
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
          await Address.updateMany(
            { user: userId },
            { $set: { active: false } }
          )
          const result = await Address.create(args)
          await User.findByIdAndUpdate(userId, {
            // @ts-ignore
            $addToSet: { address: result._id },
          })
          return result
        } else {
          const address = await Address.findOneAndUpdate(
            { _id: args.id },
            args,
            {
              new: true,
              upsert: true,
            }
          )
          await address.save() // To fire pre save hoook
          return address
        }
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    updateAddress: async (
      root,
      args: any,
      { req }: { req: Request }
    ): Promise<AddressDocument | null> => {
      // await validate(addressSchema, args)
      const { userId } = req.session
      args.user = userId
      try {
        const address = await Address.findOneAndUpdate(
          { _id: args.id },
          { $set: args },
          { new: true }
        )
        return address
      } catch (e) {
        throw new UserInputError(e)
      }
    },

    deleteAddress: async (
      root,
      args: {
        id: string
      },
      { req }: { req: Request }
    ): Promise<boolean> => {
      const { userId } = req.session
      try {
        const address = await Address.deleteOne({ _id: args.id, user: userId })
        await User.updateOne(
          { _id: userId },
          // @ts-ignore
          { $pull: { address: address._id } }
        )
        return address.deletedCount == 1
      } catch (e) {
        throw new UserInputError(e)
      }
    },
  },
}

export default resolvers
