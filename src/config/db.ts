import { ConnectionOptions } from 'mongoose'
const {
  MONGO_USERNAME = 'admin',
  MONGO_PASSWORD = 'secret',
  MONGO_HOST = 'localhost',
  MONGO_PORT = 27017,
  MONGO_DATABASE = 'litekart-fashion',
} = process.env

export const {
  MONGO_URI = `mongodb://${MONGO_USERNAME}:${encodeURIComponent(
    MONGO_PASSWORD
  )}@${MONGO_HOST}:${MONGO_PORT}/${MONGO_DATABASE}?authSource=admin`,
} = process.env
export const MONGO_OPTIONS: ConnectionOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}

export const { ELASTIC_NODE = 'http://localhost:9200' } = process.env
