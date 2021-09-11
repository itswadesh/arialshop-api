import { exportCSV, toJson } from '../utils'
import { Search, User } from '../models'
export default async function (req: any, res: any) {
  const { userId } = req.session
  const user = await User.findById(userId)
  const name = 'popularSearches'
  const sort = req.query.sort || '-updatedAt'
  const skip = parseInt(req.query.skip || 0)
  const limit = parseInt(req.query.limit || 30)
  let where = toJson(req.query.where) || {}
  if (user.store) where.store = user.store
  if (req.query.search) where.q = { $regex: new RegExp(req.query.search, 'ig') }
  try {
    const filePath = await exportCSV({
      name,
      model: Search,
      skip,
      limit,
      where,
      fields: ['_id', 'popularity', 'text'],
    })
    res.download(filePath)
  } catch (e) {
    return res.status(500).send(e.toString())
  }
}
