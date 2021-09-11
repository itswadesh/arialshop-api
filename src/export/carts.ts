import { exportCSV, toJson } from '../utils'
import { Cart, User } from '../models'

export default async function (req: any, res: any) {
  const { userId } = req.session
  const user = await User.findById(userId)
  const name = 'carts'
  const sort = req.query.sort || '-updatedAt'
  const skip = parseInt(req.query.skip || 0)
  const limit = parseInt(req.query.limit || 30)
  let where = toJson(req.query.where) || {}
  if (user.store) where.store = user.store
  if (req.query.search) where.q = { $regex: new RegExp(req.query.search, 'ig') }
  try {
    const filePath = await exportCSV({
      name,
      model: Cart,
      skip,
      limit,
      where,
      fields: [
        '_id',
        'pid',
        'vid',
        'uid',
        'options',
        'tracking',
        'vendor',
        'name',
        'img',
        'slug',
        'price',
        'qty',
        'time',
      ],
    })
    res.download(filePath)
  } catch (e) {
    return res.status(500).send(e.toString())
  }
}
