import { exportCSV, toJson } from '../utils'
import { Channel } from '../models'
export default async function (req: any, res: any) {
  const name = 'myChannels'
  const sort = req.query.sort || '-updatedAt'
  const skip = parseInt(req.query.skip || 0)
  const limit = parseInt(req.query.limit || 30)
  const where = toJson(req.query.where) || {}
  const { userId } = req.session
  // if (userId) where.user = userId
  if (req.query.search) where.q = { $regex: new RegExp(req.query.search, 'ig') }
  try {
    const filePath = await exportCSV({
      name,
      model: Channel,
      skip,
      limit,
      where,
      fields: [
        '_id',
        'cid',
        'code',
        'ctime',
        'hlsPullUrl',
        'httpPullUrl',
        'img',
        'msg',
        'name',
        'product',
        'products',
        'pushUrl',
        'requestId',
        'rtmpPullUrl',
        'scheduleDateTime',
        'status',
        'title',
        'token',
        'user',
        'users',
        'eventType',
        'streamUrl',
        'channelName',
        'channelId',
        'taskId',
        'timestamp',
        'videos',
      ],
    })
    res.download(filePath)
  } catch (e) {
    return res.status(500).send(e.toString())
  }
}
