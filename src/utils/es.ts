import { ELASTIC_NODE } from '../config'
import { Autocomplete, Product, Store } from '../models'

const { Client } = require('@elastic/elasticsearch')
require('dotenv').config()
// Client creation moved to respective method calls because it breaks the server when place here without try,catch
let client: any
try {
  client = new Client({
    nodes: [ELASTIC_NODE],
  })
} catch (e) {}
export const ping = async (req: any, res: any) => {
  if (!client) throw new Error('Elastic Client not available.')
  client.ping(
    {
      requestTimeout: 30000,
    },
    function (error: any) {
      if (error) {
        res.status(500)
        return res.json({
          status: false,
          msg: 'Elasticsearch cluster is down!',
        })
      } else {
        res.status(200)
        return res.json({
          status: true,
          msg: 'Success! Elasticsearch cluster is up!',
        })
      }
    }
  )
}

// 1. List index
export const listIndex = async () => {
  if (!client) throw new Error('Elastic Client not available.')
  const indices: any = await client.cat.indices({ format: 'json' })
  return indices
}

// 1. Create index
export const createIndex = async (index: any) => {
  if (!client) throw new Error('Elastic Client not available.')
  const data: any = await client.indices.create({ index })
  return data
}

// 2. Check if index exists
export const indexExists = async (index: any) => {
  if (!client) throw new Error('Elastic Client not available.')
  const data: any = await client.indices.exists({ index })
  return data
}

// 3.  Preparing index and its mapping
export const initMapping = async (index: any, body: any) => {
  if (!client) throw new Error('Elastic Client not available.')
  const data: any = await client.indices.putMapping({ index, body })
  return data
}

// 4. Add/Update a document
export const addDocument = async (index: any, id: any, body: any) => {
  if (!client) throw new Error('Elastic Client not available.')
  const data: any = await client.index({ index, id, body })
  return data
}

// 5. Update a document
export const updateDocument = async (index: any, id: any, body: any) => {
  if (!client) throw new Error('Elastic Client not available.')
  try {
    const data: any = await client.update({ index, id, body })
    return data
  } catch (e) {
    throw e.message
  }
}

// 6. Search
export const search = async (index: any, body: any) => {
  if (!client) throw new Error('Elastic Client not available.')
  try {
    const data: any = await client.search({ index, body })
    return data
  } catch (e) {
    throw e.message
  }
}

// Delete a document from an index
export const deleteDocument = async (index: any, id: any) => {
  if (!client) throw new Error('Elastic Client not available.')
  try {
    const data: any = await client.delete({ index, id })
    return data
  } catch (e) {
    throw e.message
  }
}

// Never do {index:'_all'}... this, this will also delete security. Hence you won't be able to login
export const deleteProductsFromEs = async () => {
  if (!client) throw new Error('Elastic Client not available.')
  await client.deleteByQuery({
    index: 'products',
    body: {
      query: {
        match_all: {},
      },
    },
  })
}

// Never do {index:'_all'}... this, this will also delete security. Hence you won't be able to login
export const deleteAll = async () => {
  if (!client) throw new Error('Elastic Client not available.')
  client.indices.delete(
    {
      index: 'products',
    },
    function (err: any, resp: any) {
      if (err) {
        console.error(err.message)
      } else {
        // console.log('Indexes have been deleted!', resp);
        return resp
      }
    }
  )
}

export const truncateFromEs = async () => {
  const products = await Product.count()
  const chunks = Math.ceil(products / 10) // ES defaults to 10 records
  console.log(`ES:: ${chunks} products removed.`)
  for (let i = 0; i <= chunks; i++) {
    //Own Function Closure Using an IIFE to support async/await
    ;(async function () {
      // @ts-ignore
      await Product.esTruncate()
    })
  }
}

export const syncStoresToES = async () => {
  // If there is connection then only sync
  try {
    client = new Client({
      nodes: [ELASTIC_NODE],
    })
    await client.search({ index: 'stores' })
    // @ts-ignore
    let stream = await Store.synchronize(),
      count = 0
    stream.on('data', function (err: any, doc: any) {
      count++
    })
    stream.on('close', function () {
      console.log('indexed ' + count + ' documents!')
    })
    stream.on('error', function (err: any) {
      console.log(err)
    })
  } catch (e) {
    console.log('syncStoresToES ERR:::', e.toString())
  }
}

export const syncProductsToES = async () => {
  // If there is connection then only sync
  try {
    client = new Client({
      nodes: [ELASTIC_NODE],
    })
    await client.search({ index: 'products' })
    // @ts-ignore
    let stream = await Product.synchronize(),
      count = 0
    stream.on('data', function (err: any, doc: any) {
      count++
    })
    stream.on('close', function () {
      console.log('indexed ' + count + ' documents!')
    })
    stream.on('error', function (err: any) {
      console.log(err)
    })
  } catch (e) {
    console.log('syncProductsToES ERR:::', e.toString())
  }
}

export const syncAutocompleteToES = async () => {
  // @ts-ignore
  let stream = await Autocomplete.synchronize(),
    count = 0
  stream.on('data', function (err: any, doc: any) {
    count++
  })
  stream.on('close', function () {
    console.log('indexed ' + count + ' documents!')
  })
  stream.on('error', function (err: any) {
    console.log(err)
  })
}
