export * from './app'

export * from './store'

export * from './auth'

export * from './db'

export * from './cache'

export * from './mail'

export * from './lulu'

export * from './session'

export * from './payment'

export * from './logs'

export * from './sms'

export * from './google'

export * from './media'

export * from './queue'

export * from './order'

export * from './live-streaming'

export * from './shipping'

import { IN_PROD } from './app'
export const APOLLO_OPTIONS = {
  introspection: true, //!IN_PROD,
  playground: {
    settings: {
      'request.credentials': 'include',
    },
  },
}
