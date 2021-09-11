import { exportCSV, toJson } from '../utils'
import { Brand } from '../models'
export default async function (req: any, res: any) {
  const name = 'pages'
  const sort = req.query.sort || '-updatedAt'
  const skip = parseInt(req.query.skip || 0)
  const limit = parseInt(req.query.limit || 30)
  const where = toJson(req.query.where) || {}
  if (req.query.search) where.q = { $regex: new RegExp(req.query.search, 'ig') }
  try {
    const filePath = await exportCSV({
      name,
      model: Brand,
      skip,
      limit,
      where,
      fields: [
        '_id',
        'content',
        'description',
        'menuTitle',
        'name',
        'slug',
        'title',
        'active',
      ],
    })
    res.download(filePath)
  } catch (e) {
    return res.status(500).send(e.toString())
  }
}
