import { REDIS_OPTIONS } from '../config'

const redis = require('redis')
const { promisify } = require('util')
const client = redis.createClient(REDIS_OPTIONS)

client.on('error', function (error: any) {
  console.error(error)
})
client.hget = promisify(client.hget).bind(client)
client.hmset = promisify(client.hmset).bind(client)
client.keys = promisify(client.keys).bind(client)
client.hgetall = promisify(client.hgetall).bind(client)

export const getCache = async (key: string, query: any) => {
  const cacheValue: any = await client.hget(key, query)
  if (cacheValue) {
    const doc = JSON.parse(cacheValue)
    // console.log('Response from Redis', cacheValue)
    return doc
  } else {
    return false
  }
}
export const setCache = async (key: string, query: any, result: any) => {
  await client.hmset(key, query, JSON.stringify(result))
  client.expire(key, 3600)
  return 'success'
}
export const removeBulk = async ({ key, query }: any) => {
  const deleted_keys = await client.hdel(key, query)
  return deleted_keys
}
export const clearKey = async (hashKey: any) => {
  const d = await client.del(hashKey)
}
export const getKeys = async () => {
  const keys = await client.keys('*')
  return keys
}
export const getKey = async (hashKey: any) => {
  const keys = await client.hgetall(hashKey)
  return keys
}
