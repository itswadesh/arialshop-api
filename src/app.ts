import express, { RequestHandler, NextFunction } from 'express'
import session from 'express-session'
import passport from 'passport'
import morgan from 'morgan'
import dayjs from 'dayjs'
import colors from 'colors'
import { ApolloServer } from 'apollo-server-express'
import typeDefs from './typeDefs'
import resolvers from './resolvers'
import schemaDirectives from './directives'
import { v4 as uuidv4 } from 'uuid'
import {
  SESSION_OPTIONS,
  APOLLO_OPTIONS,
  STATIC_PATH,
  SENTRY_DNS,
  IN_PROD,
} from './config'
const {
  GraphQLUpload, // The GraphQL "Upload" Scalar
  graphqlUploadExpress, // The Express middleware.
} = require('graphql-upload')
import { Request, Response } from './types'
import { ensureSignedIn } from './auth'
import oAuthRoutes from './oauth'
import exportRoutes from './export'
import esRoutes from './es'
import payRoutes from './pay'
// const Sentry = require('@sentry/node');
export const createApp = (store?: session.Store) => {
  const app = express()

  // The request handler must be the first middleware on the app
  // Sentry.init({ dsn: SENTRY_DNS });
  // app.use(Sentry.Handlers.requestHandler());

  const sessionHandler = session({
    ...SESSION_OPTIONS,
    genid: function (req) {
      return uuidv4() // use UUIDs for session IDs
    },
    store,
  })

  // Setup Passport
  app.use(sessionHandler)
  app.use(passport.initialize())
  app.use(passport.session())
  if (IN_PROD) {
    morgan.token('graphql-query', (req: any) => {
      const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
      const { query, variables, operationName } = req.body
      return `${dayjs().format(
        'DD-MMM-YYYY HH:mm:ss'
      )}: ${ip} : ${colors.yellow(operationName)}`
    })
    app.use(morgan(':graphql-query'))
  }
  app.use(express.urlencoded({ extended: true }))
  app.use(express.json())

  oAuthRoutes(app)
  exportRoutes(app)
  esRoutes(app)
  payRoutes(app)

  app.use(express.static(STATIC_PATH))

  // The error handler must be before any other error middleware and after all controllers
  // app.use(Sentry.Handlers.errorHandler());

  const BASIC_LOGGING = {
    requestDidStart(requestContext) {
      console.log('request started')
      console.log(requestContext.request.query)
      console.log(requestContext.request.variables)
      return {
        didEncounterErrors(requestContext) {
          console.log(
            'an error happened in response to query ' +
              requestContext.request.query
          )
          console.log(requestContext.errors)
        },
      }
    },

    willSendResponse(requestContext) {
      console.log('response sent', requestContext.response)
    },
  }

  const server = new ApolloServer({
    ...APOLLO_OPTIONS,
    uploads: false,
    typeDefs,
    resolvers,
    // plugins: [BASIC_LOGGING],
    schemaDirectives,
    context: ({ req, res, connection }) =>
      connection ? connection.context : { req, res },
    subscriptions: {
      onConnect: async (connectionParams, webSocket, { request }) => {
        const req = await new Promise((resolve) => {
          sessionHandler(request as Request, {} as Response, () => {
            // Directives are ignored in WS; need to auth explicitly
            // ensureSignedIn(request as Request)

            resolve(request)
          })
        })

        return { req }
      },
    },
  })
  app.use(graphqlUploadExpress()) // New!
  server.applyMiddleware({ app, cors: false })

  return { app, server }
}
