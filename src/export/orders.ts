import { exportCSV, fields, toJson } from '../utils'
import { Order, User } from '../models'
export default async function (req: any, res: any) {
  const { userId } = req.session
  const user = await User.findById(userId)
  const name = 'orders'
  const sort = req.query.sort || '-updatedAt'
  const skip = parseInt(req.query.skip || 0)
  const limit = parseInt(req.query.limit)
  let where = toJson(req.query.where) || {}
  if (user.store) where.store = user.store
  if (req.query.search) where.q = { $regex: new RegExp(req.query.search, 'ig') }
  let fields
  if (req.query.fields) {
    fields = req.query.fields.split(',')
  } else {
    fields = [
      '_id',
      'orderNo',
      'cartId',
      'otp',
      'userFirstName',
      'userLastName',
      'userPhone',
      'address.email',
      'payment',
      'paymentMode',
      'paymentAmount',
      'paymentCurrency',
      'paymentReferenceId',
      'paymentTxStatus',
      'payment.type',
      'amount.qty',
      'amount.subtotal',
      'amount.shipping',
      'amount.discount',
      'coupon',
      'comment',
      'cancellationReason',
      'cancellationComment',
      'returnComment',
      'active',
      'paymentOrderId',
      'codPaid',
      'item.status',
      'item._id',
      'item.pid',
      'item.name',
      'item.vendorInfo.firstName',
      'item.vendorInfo.lastName',
      'item.vendorInfo.phone',
      'item.vendorInfo.email',
      'item.price',
      'item.qty',
      'item.img',
      'item.reviewed',
      'createdAt',
      'updatedAt',
    ]
  }

  try {
    const filePath = await exportCSV({
      name,
      model: Order,
      skip,
      limit,
      where,
      fields,
    })
    res.download(filePath)
  } catch (e) {
    return res.status(500).send(e.toString())
  }
}
