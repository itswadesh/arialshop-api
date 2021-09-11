import { exportCSV, toJson } from '../utils'
import { Category, User } from '../models'
export default async function (req: any, res: any) {
  const { userId } = req.session
  const user = await User.findById(userId)
  const name = 'categories'
  const sort = req.query.sort || '-updatedAt'
  const skip = parseInt(req.query.skip || 0)
  const limit = parseInt(req.query.limit || 30)
  let where = toJson(req.query.where) || {}
  if (user.store) where.store = user.store
  if (req.query.search) where.q = { $regex: new RegExp(req.query.search, 'ig') }
  try {
    const filePath = await exportCSV({
      name,
      model: Category,
      skip,
      limit,
      where,
      fields: [
        '_id',
        'category_id',
        'category',
        'parent_category_id',
        'parent_category',
        'img',
        'active',
        'position',
        'megamenu',
        'featured',
        'shopbycategory',
        'brand_id',
      ],
    })
    res.download(filePath)
  } catch (e) {
    return res.status(500).send(e.toString())
  }
}
