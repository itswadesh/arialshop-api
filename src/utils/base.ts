import { Setting, Product, Category, User, Store } from '../models'
import { toJson } from './json'
import { fields } from './'
import { searchFields } from './graphql'
import { UserInputError } from 'apollo-server-express'
import dayjs from 'dayjs'

export const index = async ({
  model,
  args,
  info,
  userId,
  isMultiStore = false,
  attachStoreFromSession = false,
}: any) => {
  let store = null
  const setting: any = await Setting.findOne()
  if (!setting) throw new UserInputError('No settings defined in database')
  const stor = await Store.findOne({ user: userId })
  if (attachStoreFromSession && stor) args.store = stor.id

  if (setting.isMultiStore && !args.store && isMultiStore)
    store = '610591aa8a331e1c9b99113c'
  else if (setting.isMultiStore && isMultiStore && !!args.store) {
    store = args.store
  }
  const page = !args.page && args.page != 0 ? 1 : parseInt(args.page)
  const qlimit = parseInt(args.limit || 0)
  const where = toJson(args.where) || args || {}
  const sort = args.sort || where.sort || '-_id'
  const search = args.search
  const select = toJson(info)
  const populate = toJson(args.populate)
  delete args.page
  delete args.sort
  delete args.search
  delete args.select
  delete args.populate
  delete args.limit
  delete args.store
  delete where.page
  delete where.sort
  delete where.search // This is provided through args and work as a textsearch
  for (const k in where) {
    if (
      (where[k] === '' ||
        where[k] == 'null' ||
        where[k] === 'undefined' ||
        where[k] === undefined) &&
      typeof where[k] != 'boolean'
    )
      delete where[k]

    if (where[k] == 'blank') where[k] = null
  }
  if (where.price) {
    let price = where.price
    if (typeof where.price == 'string') price = { ...where.price.split(',') }
    where.price = {}
    if (price[0]) where.price['$gt'] = +(price[0] || -1)
    if (price[1]) where.price['$lt'] = +price[1]
    if (!price.length) delete where.price
    // console.log('where.price....',where.price);
    // where.price = { $gt: +(price[0] || -1), $lt: +(price[1] || 1000000000) }
  }
  if (where.category) {
    const c: any = await Category.findOne({ slug: where.category })
    if (c) {
      where.categories = c.id
      delete where.category
    }
  }
  if (where.vendor) {
    const c = await User.findOne({ role: 'vendor', slug: where.vendor })
    if (c) where.vendor = c._id
  }
  if (where.vendors && where.vendors.length) {
    where.vendor = { $in: where.vendors }
    delete where.vendors
  }
  if (where.categories && where.categories.length) {
    where.categories = { $in: where.categories }
  }
  if (where.dates && where.dates.length) {
    if (where.dates[0])
      where.createdAt = {
        $gte: dayjs(where.dates[0]),
        $lt: dayjs(where.dates[1]).add(1, 'day'), // Can not use $lte because it also take time into account hence becomes 2021-06-30T18:30:00.000Z,2021-07-01T18:30:00.000Z which ultimately incurs no result
      }
    delete where.dates
  }

  if (where.brands && where.brands.length) {
    where.brand = { $in: where.brands }
    delete where.brands
  }
  if (where.brand && where.brand.length) {
    where.brand = { $in: where.brand }
  }
  if (store) {
    where.store = store
  }
  const role = 'user'
  //   if (req.user) {
  //     role = req.user.role
  //   }
  let skip = 0,
    limit = 0,
    pageSize = setting.pageSize || 1,
    noOfPage = 1
  if (page == 0 && qlimit != 0) {
    // If page param supplied as 0, limit specified (Deactivate paging)
    limit = qlimit
    pageSize = limit
  } else {
    // Normal pagination
    limit = setting.pageSize || 1
    skip = (page - 1) * (setting.pageSize || 1)
  }
  if (args.uid) {
    // Find only records that belong to the logged in user
    where.uid = args.uid
  }
  let searchString = where
  if (search != 'null' && !!search)
    searchString = { ...where, $text: { $search: search } }
  try {
    const data: any = await model
      .find(searchString, searchFields(info))
      .sort(sort)
      .limit(limit)
      .skip(skip)
      .populate(populate)
      .exec()
    const count: any = await model.countDocuments(searchString)
    noOfPage = Math.ceil(count / pageSize || 1)
    return { data, count, pageSize, noOfPage, page }
  } catch (e) {
    throw new UserInputError(e)
  }
}

export const indexSub = async ({ model, args, info }: any) => {
  const setting: any = await Setting.findOne()
  const page = !args.page && args.page != 0 ? 1 : parseInt(args.page)
  const qlimit = parseInt(args.limit || 0)
  const sort = args.sort || '-_id'
  const search = args.search
  const select = toJson(info)
  const populate = toJson(args.populate)
  delete args.page
  delete args.sort
  delete args.search
  delete args.select
  delete args.populate
  delete args.limit
  let where = args

  for (const k in where) {
    if (
      where[k] == '' ||
      where[k] == 'null' ||
      where[k] == 'undefined' ||
      where[k] == undefined
    )
      delete where[k]
    if (where[k] == 'blank') where[k] = null
  }
  where = toJson(where) || {}
  const role = 'user'

  //   if (req.user) {
  //     role = req.user.role
  //   }
  let skip = 0,
    limit = 0,
    pageSize = setting.pageSize || 1,
    noOfPage = 1
  if (page == 0 && qlimit != 0) {
    // If page param supplied as 0, limit specified (Deactivate paging)
    limit = qlimit
    pageSize = limit
  } else {
    // Normal pagination
    limit = setting.pageSize || 1
    skip = (page - 1) * (setting.pageSize || 1)
  }
  if (args.uid) {
    // Find only records that belong to the logged in user
    where.uid = args.uid
  }
  let searchString = where
  if (search != 'null' && !!search)
    searchString = { ...where, q: { $regex: new RegExp(search, 'ig') } }
  const data: any = await model.aggregate([
    { $match: searchString },
    { $unwind: '$items' },
    { $match: args },
    // { $project: { orderNo: 1, createdAt: 1, updatedAt:1, items: 1, address: 1, s: { $sum: "$items.price" } } },
    {
      $group: {
        _id: {
          id: '$_id',
          orderNo: '$orderNo',
          createdAt: '$createdAt',
          updatedAt: '$updatedAt',
          reviewed: '$reviewed',
          address: '$address',
          payment: '$payment',
          amount: '$amount',
          vendor: '$items.vendor',
          user: '$user',
        },
        items: { $addToSet: '$items' },
        total: { $sum: '$items.price' },
      },
    },
    { $sort: { _id: -1 } },
  ])
  const count: any = await model.countDocuments(searchString)
  noOfPage = Math.ceil(count / pageSize || 1)
  return { data, count, pageSize, noOfPage, page }
}
