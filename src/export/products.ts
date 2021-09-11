import { exportCSV, toJson } from '../utils'
import { Product, User } from '../models'
export default async function (req: any, res: any) {
  const { userId } = req.session
  const user = await User.findById(userId)
  const name = 'products'
  const sort = req.query.sort || '-updatedAt'
  const skip = parseInt(req.query.skip || 0)
  const limit = parseInt(req.query.limit)
  let where = toJson(req.query.where) || {}
  if (user.store) where.store = user.store
  if (req.query.search) where.q = { $regex: new RegExp(req.query.search, 'ig') }
  try {
    const filePath = await exportCSV({
      name,
      model: Product,
      skip,
      limit,
      where,
      fields: [
        '_id',
        'barcode',
        'sku',
        'style_code',
        'ean_no',
        'article_code',
        'product_master_id',
        'name',
        'description',
        'parent_brand_id',
        'parent_brand',
        'brand_id',
        'brand',
        'categories',
        'mrp',
        'price',
        'hsn',
        'tax',
        'color',
        'color_code',
        'size',
        'gender',
        'currency',
        'vendor_phone',
        'vendor_email',
        'vendor_name',
        'manufacturer',
        'key_features',
        'product_specifications',
        'product_details',
        'return_info',
        'country_of_origin',
        'img',
        'images',
        'link',
        'condition',
        'gtin',
        'stock',
        'item_id',
        'warranty',
        'age_min',
        'age_max',
        'age_unit',
        'keywords',
        'type',
        'replace_allowed',
        'return_allowed',
        'return_validity_in_days',
        'metaTitle',
        'metaDescription',
      ],
    })
    res.download(filePath)
  } catch (e) {
    return res.status(500).send(e.toString())
  }
}
