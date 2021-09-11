import { Brand, Color, Category, Feature, Setting, Size, User } from '../models'
import fsx from 'fs-extra'
import { ObjectId } from 'mongodb'
import { UserInputError } from 'apollo-server-errors'
export const delayDelete = async (filePath: string) => {
  setTimeout(async function () {
    try {
      await fsx.unlink(filePath) // delete file after 30 sec
    } catch (e) {
      console.error(e.toString())
    }
  }, 30000)
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

export const exportCSV = async ({
  name,
  model,
  skip,
  limit,
  where,
  fields,
}: any) => {
  const Json2csvParser = require('json2csv').Parser
  const filePath = `./exports/${name}.csv`
  let csv
  let data = []
  try {
    const settings = await Setting.findOne({}).exec()
    if (!settings) return
    limit = limit || settings.pageSize || 30
    // console.log('before aggregation for export:', where)
    where = convertToObjectId(where)
    if (name == 'products') {
      // console.log('export products')
      data = await model
        .aggregate([
          { $match: where },
          { $skip: skip },
          { $limit: limit },
          // { $project: { _id: 1, name: 1 } }, //use for selected field but we r using diffrent approach
        ])
        .allowDiskUse(true)
      await Color.populate(data, {
        path: 'color',
        select: { _id: 1, name: 1, color_code: 1 },
      })
      await Size.populate(data, {
        path: 'size',
        select: { _id: 1, name: 1 },
      })
      await Brand.populate(data, {
        path: 'brand parentBrand',
        select: { _id: 1, name: 1, brandId: 1 },
      })
      await Category.populate(data, {
        path: 'categories',
        select: { _id: 1, categoryId: 1 },
      })
      await User.populate(data, {
        path: 'vendor',
        select: { _id: 1, phone: 1, email: 1, firstName: 1 },
      })
      await Feature.populate(data, {
        path: 'productDetails specifications',
        select: { _id: 1, name: 1, value: 1 },
      })
      data.map((p) => {
        if (p.brand) {
          if (p.brand.brandId) p.brand_id = p.brand.brandId
          if (p.brand.name) p.brand = p.brand.name
        }
        if (p.color) {
          if (p.color.color_code) p.color_code = p.color.color_code
          if (p.color.name) p.color = p.color.name
        }
        if (p.parentBrand) {
          if (p.parentBrand.name) p.parent_brand = p.parentBrand.name
          if (p.parentBrand.brandId) p.parent_brand_id = p.parentBrand.brandId
          delete p.parentBrand
        }
        if (p.styleCode) p.style_code = p.styleCode
        if (p.eanNo) p.ean_no = p.eanNo
        if (p.articleCode) p.article_code = p.articleCode
        if (p.productMasterId) p.product_master_id = p.productMasterId
        if (p.categories) {
          let cate = ''
          for (let cat of p.categories) {
            if (cate == '') cate = cat.categoryId
            else cate = cate + '|' + cat.categoryId
          }
          p.categories = cate
        }
        if (p.vendor) {
          if (p.vendor.phone) p.vendor_phone = p.vendor.phone
          if (p.vendor.email) p.vendor_email = p.vendor.email
          if (p.vendor.firstName) p.vendor_name = p.vendor.firstName
        }
        if (p.keyFeatures) {
          let key_features = ''
          for (let kf of p.keyFeatures) {
            if (key_features == '') key_features = kf
            else key_features = key_features + '|' + kf
          }
          p.key_features = key_features
        }
        if (p.productDetails) {
          let product_details = ''
          for (let feature of p.productDetails) {
            if (product_details == '') {
              product_details = feature.name + '::' + feature.value
            } else {
              product_details =
                product_details + '|' + feature.name + '::' + feature.value
            }
          }
          p.product_details = product_details
        }
        if (p.specifications) {
          let specifications = ''
          for (let feature of p.specifications) {
            if (specifications == '') {
              specifications = feature.name + '::' + feature.value
            } else {
              specifications =
                specifications + '|' + feature.name + '::' + feature.value
            }
          }
          p.product_specifications = specifications
        }
        if (p.returnInfo) p.return_info = p.returnInfo
        if (p.countryOfOrigin) p.country_of_origin = p.countryOfOrigin
        if (p.itemId) p.item_id = p.itemId
        if (p.ageMin) p.age_min = p.ageMin
        if (p.ageMax) p.age_max = p.ageMax
        if (p.ageUnit) p.age_unit = p.ageUnit
        if (p.replaceAllowed) p.replace_allowed = p.replaceAllowed
        if (p.returnAllowed) p.return_allowed = p.returnAllowed
        if (p.returnValidityInDays)
          p.return_validity_in_days = p.returnValidityInDays
        if (p.size) p.size = p.size.name
        if (p.images) {
          let images = ''
          for (let image of p.images) {
            if (images == '') images = image
            else images = images + ',' + image
          }
          p.images = images
        }
      })
    } else if (name == 'orders') {
      // console.log('export orders')
      const orders = await model
        .aggregate([{ $match: where }, { $skip: skip }, { $limit: limit }])
        .allowDiskUse(true)
      await User.populate(orders, {
        path: 'user',
      })
      for (const o of orders) {
        if (o.items.length > 1) {
          // console.log('more than one item in order-id:', o._id, 'so split')
          for (const item of o.items) {
            const order = { ...o }
            delete order.items
            order.item = item
            data.push(order)
          }
        } else {
          // console.log('only one item in order-id:', o._id)
          o.item = o.items[0]
          delete o.items
          data.push(o)
        }
      }
    } else if (name == 'categories') {
      // console.log('export categories')
      data = await model
        .aggregate([{ $match: where }, { $skip: skip }, { $limit: limit }])
        .allowDiskUse(true)
      await Brand.populate(data, {
        path: 'brand',
      })
      await Category.populate(data, {
        path: 'parent',
      })
      data.map((c) => {
        if (c.categoryId) c.category_id = c.categoryId
        if (c.name) c.category = c.name
        if (c.parent) {
          if (c.parent.categoryId) c.parent_category_id = c.parent.categoryId
          if (c.parent.name) c.parent_category = c.parent.name
        }
        if (c.brand) {
          if (c.brand.brandId) c.brand_id = c.brand.brandId
        }
      })
    } else {
      // console.log('export othere', name)
      data = await model
        .aggregate([{ $match: where }, { $skip: skip }, { $limit: limit }])
        .allowDiskUse(true)
      //  for (const o of data) {
      //    if (o.items.length > 1) {
      //      // console.log('more than one item in order-id:', o._id, 'so split')
      //      for (const item of o.items) {
      //        const order = { ...o }
      //        delete order.items
      //        order.item = item
      //        data.push(order)
      //      }
      //    } else {
      //      // console.log('only one item in order-id:', o._id)
      //      o.item = o.items[0]
      //      delete o.items
      //      data.push(o)
      //    }
      //  }
      // console.log('data', data)

      // data = await model
      //   .aggregate([
      //     {
      //       $match: {
      //         brand: {
      //           $in: [
      //             ObjectID('6014c 7762697f84598c730b7'),
      //             ObjectID('6014c7762697f84598c730bb'),
      //           ],
      //         },
      //       },
      //     },
      //     { $skip: skip },
      //     { $limit: limit },
      //   ])
      //   .allowDiskUse(true)
      // console.log('after aggregation the data is:', data.length, data)
    }
  } catch (e) {
    console.log('export err...', e.toString())
    data = [e.toString()]
  }
  const unwindBlank: any = []
  try {
    const json2csvParser = new Json2csvParser({
      fields,
      unwindBlank,
      flatten: true,
    })
    csv = json2csvParser.parse(data)
  } catch (err) {
    throw new UserInputError(err)
  }
  try {
    await fsx.writeFile(filePath, csv)
    await delayDelete(filePath)
    return filePath
  } catch (e) {
    throw new UserInputError(e)
  }
}
