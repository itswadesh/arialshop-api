import { ObjectId } from 'mongodb'
import { mustBuilder, mustAggBuilder, dedupeIDs, unique } from '../'
import { getCache, setCache } from '../cache'
import { Store, Category, Color, Setting } from '../../models'
import { mustStoreAggBuilder, mustStoreBuilder } from '../aggs'
// const { ObjectId } = require('mongodb')
export const esQueryStore = async (q: any = {}) => {
  let settings: any = await getCache('settings', 'public')
  if (!settings) {
    try {
      settings = await Setting.findOne()
      setCache('settings', 'public', settings) // Set cache
    } catch (e) {
      settings = {}
    }
  }
  if (!q) q = 'page=1'
  if (q.store == 'undefined') q.store = 'garbagemisikistore'
  const s: string = q.q
  const page = parseInt(q.page) || 1
  const store: any = q.store || null
  const qsort: string = q.sort || ''
  let sort: any = { createdAt: 'desc' }
  if (qsort) {
    if (qsort == 'name') sort = { 'name.keyword': 'asc' }
    else if (qsort == '-name') sort = { 'name.keyword': 'desc' }
  }
  delete q.page
  delete q.name
  delete q.q
  const must = mustStoreBuilder(store, s)
  let aggSw: any = {},
    ag,
    predicates = [
      // { name: 'colors', val: 'color.name.keyword' },
    ]
  for (const i of predicates) {
    ag = mustStoreAggBuilder(store, s, i.name)
    aggSw[i.name] = {
      filter: { bool: { must: ag } },
      aggs: {
        all: { terms: { size: 100, field: i.val, order: { _key: 'asc' } } },
      },
    }
  }
  const shouldSearch: any = []
  // if (s) { // Commented on 02-Jun-2021 to limit search results to search term only
  //   shouldSearch = [
  //     {
  //       query_string: { query: s },
  //     },
  //     {
  //       multi_match: {
  //         query: s,
  //         fields: ['name', 'sku', 'brand', 'parentBrand', 'color'],
  //       },
  //     },
  //     {
  //       match_phrase_prefix: { name: s },
  //     },
  //   ]
  // }
  return {
    from: (settings.pageSize || 40) * (page - 1),
    size: settings.pageSize || 40,
    query: { bool: { must: must, should: shouldSearch } },
    aggs: {
      all_aggs: {
        global: {},
        aggs: aggSw,
      },
    },
    sort: sort,
    highlight: {
      pre_tags: ["<b style='background-color: yellow'>"],
      post_tags: ['</b>'],
      fields: {
        name: {},
        address: {},
      },
    },
  }
}

const toJson = (str: string) => {
  try {
    return JSON.parse(str)
  } catch (err) {
    return str
  }
}

export const constructQueryStore = async ({
  q,
  search,
  predicate,
  forAdmin,
}: any) => {
  const settings: any = await Setting.findOne({})
  const f = []
  let Ids = null,
    where: any = {}
  for (const i in q) {
    if (i == 'page' || i == 'limit' || i == 'skip' || i == 'sort') continue
    Ids = q[i]
    Ids = Ids.replace(/\/$/, '') // To remove trailing slash
    if (Ids && Ids.length > 0) {
      const IDS = Ids.includes(',')
        ? Ids.trim().split(',').trim()
        : [Ids.trim()]
      //  && i != 1
      // if (i == "sort") {
      //   this.fl[i] = Ids; // Required: else the sort radio text removes: when sort value
      // } else {
      //   this.fl[i] = Ids.split(",");
      // }
      if (i == 'sort') {
        q.sort = Ids
      } else if (i == 'name') {
        f.push({ name: { $regex: '.*' + Ids + '.*', $options: 'i' } })
      }
    }
  }
  if (f.length > 0) {
    where = { $and: f }
  } else {
    where = {}
  }
  let limit = settings.pageSize || 40
  let skip = 0
  if (q.page) {
    limit = settings.pageSize
    skip = (parseInt(q.page) - 1) * (settings.pageSize || 40)
  }
  const sort = q.sort || null //{ score: { $meta: "textScore" } }
  if (!forAdmin) {
    where.active = true
    where.approved = true
  }
  let searchString = where
  if (search != 'null' && !!search)
    searchString = { ...where, $text: { $search: search } }
  return { where: searchString, limit, skip, sort }
}
