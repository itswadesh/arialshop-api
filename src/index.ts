import dotenv from 'dotenv'
dotenv.config()
import mongoose from 'mongoose'
import connectRedis from 'connect-redis'
import session from 'express-session'
import Redis from 'ioredis'
import http from 'http'
import { UserInputError } from 'apollo-server-errors'
import { createApp } from './app'
import {
  MONGO_URI,
  MONGO_OPTIONS,
  REDIS_OPTIONS,
  APP_PORT,
  SEED_DATABASE,
} from './config'
//
import { seed, seedMandatory } from './seed'
import { syncProductsToES, syncAutocompleteToES } from './utils'
;(async () => {
  try {
    try {
      mongoose.set('useFindAndModify', false)
      await mongoose.connect(MONGO_URI, MONGO_OPTIONS)
    } catch (e) {
      throw new UserInputError(e)
    }
    try {
      // if (SEED_DATABASE) seed() // Seed database with some sample data if it config says so
      seedMandatory()
    } catch (e) {
      throw new UserInputError(e)
    }
    // Sync products to ES
    // try {
    //   await syncProductsToES()
    //   // await syncAutocompleteToES()
    // } catch (e) {
    //   throw new UserInputError(e)
    // }
    try {
      const RedisStore = connectRedis(session)
      const store = new RedisStore({
        client: new Redis(REDIS_OPTIONS),
      })

      const { app, server } = createApp(store)

      const httpServer = http.createServer(app)
      server.installSubscriptionHandlers(httpServer)

      httpServer.listen(APP_PORT, () => {
        console.log(`http://localhost:${APP_PORT}${server.graphqlPath}`)
        console.log(`ws://localhost:${APP_PORT}${server.subscriptionsPath}`)
      })
    } catch (e) {
      throw new UserInputError(e)
    }
  } catch (e) {
    console.error(e)
  }
})()
