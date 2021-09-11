import { Request as ExpressRequest, Response as ExpressResponse } from 'express'

export type Request = ExpressRequest & {
  // @ts-ignore
  session: Express.Session
}

export type Response = ExpressResponse
