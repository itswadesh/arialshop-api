import { toJson } from '../utils'
import { Product, User } from '../models'
import { ObjectId } from 'mongodb'

export default async function (req: any, res: any) {
  const { userId } = req.session
  const user = await User.findById(userId)
  const name = 'products'
  const sort = req.query.sort || '-updatedAt'
  const skip = parseInt(req.query.skip || 0)
  const limit = parseInt(req.query.limit || 30)
  let where = toJson(req.query.where) || {}
  if (user.store) where.store = user.store
  if (req.query.search) where.q = { $regex: new RegExp(req.query.search, 'ig') }
  try {
    let data = []
    where = convertToObjectId(where)
    // console.log('before search where is:', where)
    data = await Product.aggregate([
      { $match: where },
      { $skip: skip },
      { $limit: limit },
    ]).allowDiskUse(true)
    // console.log('found total products: ', data.length)
    const count = data.length
    res.status(200).send({ totalProducts: count })
  } catch (e) {
    return res.status(500).send(e.toString())
  }
}

const convertToObjectId = (data: any) => {
  if (data.vendor && data.vendor.$in) {
    data.vendor.$in = data.vendor.$in.map((vendor: any) => {
      return new ObjectId(vendor)
    })
  }
  if (data.brand && data.brand.$in) {
    data.brand.$in = data.brand.$in.map((brand: any) => {
      return new ObjectId(brand)
    })
  }
  if (data.color && data.color.$in) {
    data.color.$in = data.color.$in.map((color: any) => {
      return new ObjectId(color)
    })
  }
  if (data.size && data.size.$in) {
    data.size.$in = data.size.$in.map((size: any) => {
      return new ObjectId(size)
    })
  }
  if (data.categories && data.categories.$in) {
    data.categories.$in = data.categories.$in.map((categories: any) => {
      return new ObjectId(categories)
    })
  }
  return data
}
