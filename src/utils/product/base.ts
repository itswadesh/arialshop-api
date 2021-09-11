import { ObjectId } from 'mongodb'
import { mustBuilder, mustAggBuilder, dedupeIDs, unique } from '../'
import { getCache, setCache } from '../cache'
import { Product, Category, Color, Setting } from '../../models'
// const { ObjectId } = require('mongodb')
export const esQuery = async (q: any = {}) => {
  let settings: any = await getCache('settings', 'public')
  if (!settings) {
    try {
      settings = await Setting.findOne()
      setCache('settings', 'public', settings) // Set cache
    } catch (e) {
      settings = {}
    }
  }
  if (!q) q = 'page=1'
  // q = JSON.parse(
  //   '{"' +
  //     decodeURI(q)
  //       .replace(/"/g, '\\"')
  //       .replace(/&/g, '","')
  //       .replace(/=/g, '":"') +
  //     '"}'
  // )
  // q = toJson(q)
  if (q.categories == 'undefined') q.categories = []
  if (q.store == 'undefined') q.store = 'garbagemisikistore'
  const s: string = q.q
  const page = parseInt(q.page) || 1
  const store: any = q.store || null
  const categories: any = q.categories || []
  const brands: any = q.brands || []
  const parentBrands: any = q.parentBrands || []
  const genders: any = q.genders || []
  const sizes: any = q.sizes || []
  const colors: any = q.colors || []
  const price: any = q.price || []
  const age: any = q.age || []
  const discount: any = q.discount || []
  const qsort: string = q.sort || ''
  let sort: any = {}
  if (qsort) {
    if (qsort == 'name')
      sort = { 'name.keyword': 'asc', 'productMasterId.keyword': 'asc' }
    else if (qsort == '-name')
      sort = { 'name.keyword': 'desc', 'productMasterId.keyword': 'asc' }
    else if (qsort == 'price')
      sort = { price: 'asc', 'productMasterId.keyword': 'asc' }
    else if (qsort == '-price')
      sort = { price: 'desc', 'productMasterId.keyword': 'asc' }
    else if (qsort == 'createdAt')
      sort = { createdAt: 'asc', 'productMasterId.keyword': 'asc' }
    else if (qsort == '-createdAt')
      sort = { createdAt: 'desc', 'productMasterId.keyword': 'asc' }
    else if (qsort == 'discount')
      sort = { discount: 'asc', 'productMasterId.keyword': 'asc' }
    else if (qsort == '-discount')
      sort = { discount: 'desc', 'productMasterId.keyword': 'asc' }
  }
  delete q.page
  delete q.categories
  delete q.store
  delete q.brands
  delete q.parentBrands
  delete q.genders
  delete q.sizes
  delete q.colors
  delete q.price
  delete q.age
  delete q.discount
  delete q.qsort
  delete q.sort
  delete q.q
  const must = mustBuilder(
    store,
    s,
    categories,
    brands,
    parentBrands,
    genders,
    sizes,
    colors,
    price,
    age,
    discount
  )
  // console.log('must...........', must)
  // { name: 'categories', val: 'categories.name.keyword' }
  let aggSw: any = {},
    ag,
    predicates = [
      { name: 'brands', val: 'brand.name.keyword' },
      { name: 'parentBrands', val: 'parentBrand.slug.keyword' },
      { name: 'genders', val: 'gender.keyword' },
      { name: 'sizes', val: 'size.name.keyword' },
      { name: 'colors', val: 'color.name.keyword' },
    ]
  for (const i of predicates) {
    ag = mustAggBuilder(
      store,
      s,
      categories,
      brands,
      parentBrands,
      genders,
      sizes,
      colors,
      price,
      age,
      discount,
      i.name
    )
    aggSw[i.name] = {
      filter: { bool: { must: ag } },
      aggs: {
        all: { terms: { size: 100, field: i.val, order: { _key: 'asc' } } },
      },
    }
  }
  ag = mustAggBuilder(
    store,
    s,
    categories,
    brands,
    parentBrands,
    genders,
    sizes,
    colors,
    price,
    age,
    discount,
    'price'
  )
  aggSw['price'] = {
    filter: { bool: { must: ag } },
    aggs: {
      all: {
        range: {
          field: 'price',
          ranges: [
            { key: 'Under ₹250', to: 250 },
            { key: '₹250 - ₹500', from: 250, to: 500 },
            { key: '₹500 - ₹1,000', from: 500, to: 1000 },
            { key: '₹1,000 - ₹2,000', from: 1000, to: 2000 },
            { key: '₹2,000 - ₹3,000', from: 2000, to: 3000 },
            { key: '₹3,000 - ₹5,000', from: 3000, to: 5000 },
            { key: 'Over ₹5,000', from: 5000 },
          ],
        },
      },
    },
  }
  ag = mustAggBuilder(
    store,
    s,
    categories,
    brands,
    parentBrands,
    genders,
    sizes,
    colors,
    price,
    age,
    discount,
    'age'
  )
  aggSw['age'] = {
    filter: { bool: { must: ag } },
    aggs: {
      all: {
        range: {
          field: 'ageMin',
          ranges: [
            { key: 'Any', from: 0 },
            { key: 'Up to 12 months', to: 1 },
            { key: '1 - 2 years', from: 1, to: 2 },
            { key: '3 - 4 years', from: 3, to: 4 },
            { key: '5 - 7 years', from: 5, to: 7 },
            { key: '8 - 11 years', from: 8, to: 11 },
            { key: '12 years & more', from: 12 },
          ],
        },
      },
    },
  }
  aggSw['discount'] = {
    filter: { bool: { must: ag } },
    aggs: {
      all: {
        range: {
          field: 'discount',
          ranges: [
            { key: 'Any', from: 0, to: 100 },
            { key: '10% and above', from: 10, to: 100 },
            { key: '20% and above', from: 20, to: 100 },
            { key: '30% and above', from: 30, to: 100 },
            { key: '40% and above', from: 40, to: 100 },
            { key: '50% and above', from: 50, to: 100 },
            { key: '60% and above', from: 60, to: 100 },
          ],
        },
      },
    },
  }
  // ag = mustAggBuilder(s, categories, brands, sizes, colors, 'colors')
  // aggSw['colors'] = {
  //   filter: { bool: { must: ag } },
  //   aggs: {
  //     colors: {
  //       nested: {
  //         path: 'color',
  //       },
  //       aggs: {
  //         name: {
  //           terms: {
  //             size: 100,
  //             field: 'color.name.raw',
  //           },
  //           aggs: {
  //             val: {
  //               terms: {
  //                 field: 'color.val.raw',
  //                 order: {
  //                   _key: 'asc',
  //                 },
  //               },
  //             },
  //           },
  //         },
  //       },
  //     },
  //   },
  // }
  // console.log('zzzzzzzzzzzzzzzzzzzzzzzzzzz', aggSw);

  aggSw['features'] = {
    nested: {
      path: 'features',
    },
    aggs: {
      name: {
        terms: {
          size: 100,
          field: 'features.key.raw',
        },
        aggs: {
          val: {
            terms: {
              size: 100,
              field: 'features.val.raw',
              order: {
                _key: 'asc',
              },
            },
          },
        },
      },
    },
  }
  // Categories should be populated with hierarchy like chaldal.com
  // aggSw['categories'] = {
  //     "nested": {
  //         "path": "categories"
  //     },
  //     "aggs": {
  //         "all": {
  //             "terms": {
  //                 size: 100,
  //                 "field": "categories.slug.raw"
  //             },
  //             "aggs": {
  //                 "val": {
  //                     "terms": {
  //                         size: 100,
  //                         "field": "categories.name.raw",
  //                         "order": {
  //                             "_key": "asc"
  //                         }
  //                     }
  //                 }
  //             }
  //         }
  //     }
  // }
  // console.log('must....................', must)
  // console.log('agg.....................', q)
  const should: any = []
  Object.keys(q).forEach((e) => {
    if (e && e != '') {
      const feature: any = {}
      feature[e] = q[e].split(',')
      should.push({
        bool: {
          must: [
            {
              term: {
                'features.key.raw': e,
              },
            },
            {
              terms: {
                'features.val.raw': q[e].split(','),
              },
            },
          ],
        },
      })
    }
  })
  if (should.length > 0)
    must.push({
      nested: {
        path: 'features',
        query: {
          bool: {
            should: should,
          },
        },
      },
    })
  const shouldSearch: any = []
  // if (s) { // Commented on 02-Jun-2021 to limit search results to search term only
  //   shouldSearch = [
  //     {
  //       query_string: { query: s },
  //     },
  //     {
  //       multi_match: {
  //         query: s,
  //         fields: ['name', 'sku', 'brand', 'parentBrand', 'color'],
  //       },
  //     },
  //     {
  //       match_phrase_prefix: { name: s },
  //     },
  //   ]
  // }
  return {
    from: (settings.pageSize || 40) * (page - 1),
    size: settings.pageSize || 40,
    query: { bool: { must: must, should: shouldSearch } },
    collapse: {
      field: 'styleId.keyword',
      inner_hits: {
        name: 'variants',
        size: 10,
      },
    },
    aggs: {
      all_aggs: {
        global: {},
        aggs: aggSw,
      },
      style_count: {
        cardinality: {
          field: 'styleId.keyword',
        },
      },
    },
    sort: sort,
    highlight: {
      pre_tags: ["<b style='background-color: yellow'>"],
      post_tags: ['</b>'],
      fields: {
        name: {},
        brand: {},
      },
    },
  }
}

const toJson = (str: string) => {
  try {
    return JSON.parse(str)
  } catch (err) {
    return str
  }
}
export const sortVariants = async (pid: string) => {
  const result: any = await Product.update(
    { _id: new ObjectId(pid) },
    {
      $push: {
        variants: {
          $each: [],
          $sort: { sort: 1 },
        },
      },
    },
    { multi: true }
  )
  return result
}
export const constructQuery = async ({
  q,
  search,
  predicate,
  forAdmin,
}: any) => {
  const settings: any = await Setting.findOne({})
  const f = []
  let Ids = null,
    where: any = {}
  for (const i in q) {
    if (i == 'page' || i == 'limit' || i == 'skip' || i == 'sort') continue
    Ids = q[i]
    Ids = Ids.replace(/\/$/, '') // To remove trailing slash
    if (Ids && Ids.length > 0) {
      const IDS = Ids.includes(',')
        ? Ids.trim().split(',').trim()
        : [Ids.trim()]
      //  && i != 1
      // if (i == "sort") {
      //   this.fl[i] = Ids; // Required: else the sort radio text removes: when sort value
      // } else {
      //   this.fl[i] = Ids.split(",");
      // }

      if (i == 'colors' && predicate != 'colors') {
        f.push({ 'color.name': { $in: IDS } })
      } else if (i == 'brands' && predicate != 'brands') {
        f.push({ 'brand.name': { $in: IDS } })
      } else if (i == 'parentBrands' && predicate != 'parentBrands') {
        f.push({ 'parentBrand.name': { $in: IDS } })
      } else if (i == 'genders' && predicate != 'genders') {
        f.push({ gender: { $in: IDS } })
      } else if (i == 'categories' && predicate != 'categories') {
        f.push({ 'categories.slug': { $in: IDS } })
      } else if (i == 'sizes' && predicate != 'sizes') {
        f.push({ 'size.name': { $in: IDS } })
      } else if (i == 'price' && predicate != 'price') {
        f.push({
          price: {
            $gt: IDS[0],
            $lt: IDS[1],
          },
        })
      } else if (i == 'age' && predicate != 'age') {
        f.push({
          ageMin: {
            $gt: IDS[0],
            $lt: IDS[1],
          },
        })
      } else if (i == 'sort') {
        q.sort = Ids
      } else if (i == 'vendor_name') {
        f.push({ vendor_name: Ids })
      } else if (i == 'sku') {
        f.push({ sku: { $regex: '.*' + Ids + '.*', $options: 'i' } })
      } else if (i == 'name') {
        f.push({ name: { $regex: '.*' + Ids + '.*', $options: 'i' } })
      } else if (i == 'vendor_id') {
        f.push({ vendor_id: Ids })
      } else if (
        predicate != 'colors' &&
        predicate != 'brands' &&
        predicate != 'parentBrands' &&
        predicate != 'genders' &&
        predicate != 'categories' &&
        predicate != 'sizes' &&
        predicate != 'price' &&
        predicate != 'age' &&
        predicate != 'vendor_name'
      ) {
        // if (i == 'Color') {
        //   f.push({
        //     'features.key': i,
        //     'features.val': { $in: Ids.split(',') },
        //   })
        // }
      }
    }
  }
  if (f.length > 0) {
    where = { $and: f }
  } else {
    where = {}
  }
  let limit = settings.pageSize || 40
  let skip = 0
  if (q.page) {
    limit = settings.pageSize
    skip = (parseInt(q.page) - 1) * (settings.pageSize || 40)
  }
  const sort = q.sort || null //{ score: { $meta: "textScore" } }
  if (!forAdmin) {
    where.active = true
    where.approved = true
    where['stock'] = { $gt: 0 }
  }
  let searchString = where
  if (search != 'null' && !!search)
    searchString = { ...where, $text: { $search: search } }
  return { where: searchString, limit, skip, sort }
}
export const checkProductId = async (_id: string, promotions: any) => {
  try {
    // let promotions = await Promotion.find({ type: 'product', active: true, validFromDate: { $lte: new Date() }, validToDate: { $gte: new Date() } }).select('description condition productCondition action validFromDate validToDate').sort('priority')
    let product, offer, condition
    for (const o of promotions) {
      condition = o.productCondition
      try {
        condition = JSON.parse(o.productCondition)
      } catch (e) {} // If already json
      condition._id = _id
      product = await Product.findOne(condition).select(
        '_id name slug img imgUrls new hot sale brand parentBrand gender color variants._id variants.size variants.img price mrp variants.offer'
      )
      if (product) {
        product.variants.map((v: any) => {
          if (o.action.key == 'Discount' && o.action.type == 'Percent') {
            v.offer = Math.round(
              v.price - (v.price * parseInt(o.action.val)) / 100
            )
          } else if (o.action.key == 'Discount' && o.action.type == 'Fixed') {
            v.offer = Math.round(v.price - parseInt(o.action.val))
          } else {
            v.offer = 0
          }
        })
        offer = o
        break
      }
    }
    if (offer) product.offer = offer

    return product
  } catch (e) {
    return e.toString()
  }
}
export const checkProductIdV = async (
  pid: string,
  vid: string,
  promotions: any
) => {
  try {
    let product, variant, offer
    for (const o of promotions) {
      let condition: any = {}
      try {
        condition = JSON.parse(o.productCondition)
      } catch (e) {}
      condition._id = pid
      product = await Product.findOne(condition).select(
        '_id name slug img imgUrls new hot sale brand parentBrand gender color variants._id variants.size  variants.img price mrp variants.offer'
      )
      if (product) {
        variant = product.variants.id(vid)
        if (o.action.key == 'Discount' && o.action.type == 'Percent') {
          variant.offer = Math.round(
            variant.price - (variant.price * parseInt(o.action.val)) / 100
          )
        } else if (o.action.key == 'Discount' && o.action.type == 'Fixed') {
          variant.offer = Math.round(variant.price - parseInt(o.action.val))
        } else {
          variant.offer = 0
        }
        offer = o
        break
      }
    }
    // if (offer)
    //   product.offer = offer

    return { product, variant, offer }
  } catch (e) {
    return e.toString()
  }
}
export const appliedFilters = async (req: any) => {
  try {
    let brands = [],
      parentBrands = [],
      genders = [],
      colors = [],
      sizes = [],
      features = [],
      categories = [],
      price = [],
      age = []
    let searchString: any = {},
      brandSearchString: any = { where: {} },
      parentBrandSearchString: any = { where: {} },
      genderSearchString: any = { where: {} },
      colorSearchString: any = { where: {} },
      sizeSearchString: any = { where: {} },
      featureSearchString: any = { where: {} },
      categorySearchString: any = { where: {} },
      priceSearchString: any = { where: {} },
      ageSearchString: any = { where: {} }
    const query = toJson(req.query)
    query.brands = query.brands || ''
    query.genders = query.genders || ''
    query.categories = query.categories || ''
    query.sizes = query.sizes || ''
    for (const r in query) {
      if (r == 'page' || r == 'limit' || r == 'skip' || r == 'sort') continue
      // searchString = this.constructQuery({ q: toJson(req.query), search: req.params.search, predicate: r });
      // log('prices search string...', chalk.yellow(JSON.stringify(searchString.where)));
      if (r == 'brands') {
        brandSearchString = constructFacets({
          q: query,
          search: req.params.search,
          predicate: r,
        })
      }
      if (r == 'parentBrands') {
        parentBrandSearchString = constructFacets({
          q: query,
          search: req.params.search,
          predicate: r,
        })
      }
      if (r == 'genders') {
        genderSearchString = constructFacets({
          q: query,
          search: req.params.search,
          predicate: r,
        })
      }
      if (r == 'colors') {
        colorSearchString = constructFacets({
          q: query,
          search: req.params.search,
          predicate: r,
        })
      } else if (r == 'categories') {
        categorySearchString = constructFacets({
          q: query,
          search: req.params.search,
          predicate: r,
        })
      } else if (r == 'sizes') {
        sizeSearchString = constructFacets({
          q: query,
          search: req.params.search,
          predicate: r,
        })
        // log('sizes search string...', chalk.yellow(JSON.stringify(sizeSearchString.where)));
      } else if (r == 'price') {
        priceSearchString = constructFacets({
          q: query,
          search: req.params.search,
          predicate: r,
        })
        // log('sizes search string...', chalk.yellow(JSON.stringify(sizeSearchString.where)));
      } else if (r == 'age') {
        ageSearchString = constructFacets({
          q: query,
          search: req.params.search,
          predicate: r,
        })
        // log('sizes search string...', chalk.yellow(JSON.stringify(sizeSearchString.where)));
      } else {
        featureSearchString = constructFacets({
          q: query,
          search: req.params.search,
          predicate: r,
        })
        // console.log('........... search string...', JSON.stringify(featureSearchString.where));
      }
    }
    brands = await Product.aggregate([
      { $match: brandSearchString.where },
      { $sort: { brand: 1, updatedAt: -1 } },
      {
        $group: {
          _id: '$brand',
          name: { $first: '$brand.name' },
          val: { $first: '$brandSlug' },
        },
      },
    ])
    // parentBrands = await Product.aggregate([
    //   { $match: parentBrandSearchString.where },
    //   { $sort: { parentBrand: 1, updatedAt: -1 } },
    //   {
    //     $group: {
    //       _id: '$brand',
    //       name: { $first: '$brand.name' },
    //       val: { $first: '$brandSlug' },
    //     },
    //   },
    // ])
    genders = await Product.aggregate([
      { $match: genderSearchString.where },
      { $sort: { gender: 1, updatedAt: -1 } },
      {
        $group: {
          _id: '$gender',
          name: { $first: '$gender' },
        },
      },
    ])
    // colors = await Product.aggregate([
    //   { $match: colorSearchString.where },
    //   { $sort: { color: 1, updatedAt: -1 } },
    //   {
    //     $group: {
    //       _id: '$color',
    //       name: { $first: '$color.name' },
    //       val: { $first: '$colorSlug' },
    //     },
    //   },
    // ])
    sizes = await Product.aggregate([
      { $match: sizeSearchString.where },
      { $sort: { size: 1, updatedAt: -1 } },
      {
        $group: {
          _id: '$size',
          name: { $first: '$size.name' },
          val: { $first: '$sizeSlug' },
        },
      },
    ])
    const priceRes: any = await Product.aggregate([
      { $match: priceSearchString.where },
      {
        $group: {
          _id: null,
          min: { $min: '$price' },
          max: { $max: '$price' },
        },
      },
    ])
    price = [priceRes[0].min[0] || 0, priceRes[0].max[0] || 100000]
    const ageRes: any = await Product.aggregate([
      { $match: ageSearchString.where },
      {
        $group: {
          _id: null,
          min: { $min: '$age' },
          max: { $max: '$age' },
        },
      },
    ])
    age = [ageRes[0].min[0] || 0, ageRes[0].max[0] || 100000]
    // sizes = await Product.aggregate([
    //   { $match: sizeSearchString.where },
    //   { $unwind: '$variants' },
    //   { $match: { stock: { $gt: 0 } } },
    //   {
    //     $group: {
    //       _id: '$size',
    //       name: { $max: '$size' },
    //       count: { $sum: 1 },
    //     },
    //   },
    // ])
    features = await Product.aggregate([
      { $match: featureSearchString.where },
      { $unwind: '$features' },
      { $project: { key: '$features.key', val: '$features.val' } },
      {
        $group: {
          _id: '$key',
          name: { $max: '$key' },
          options: { $addToSet: { name: '$val' } },
        },
      },
    ])
    return { brands, genders, sizes, features, price }
  } catch (e) {
    throw e.toString()
  }
}
export const attachColor = async (colorObj: any) => {
  if (colorObj && colorObj.name) {
    try {
      const colorName =
        colorObj.name.charAt(0).toUpperCase() +
        colorObj.name.substr(1).toLowerCase()
      const color: any = await Color.findOne({ name: colorName })
      if (color) return color
      else {
        try {
          return await Color.create(colorObj)
        } catch (e) {
          // When no color name specified
          // console.log('xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', e.toString());
          return
        }
      }
    } catch (e) {
      return colorObj
    }
  } else if (colorObj) {
    // When color: 'Blue' instead of color: {name:'Blue'}
    throw 'Color not found.'
  } else {
    return
  }
}
export const constructFacets = async ({ q, search, predicate }: any) => {
  const settings: any = await Setting.findOne({})
  const f = []
  let Ids = null
  let where: any = {}
  for (const i in q) {
    if (i == 'page' || i == 'limit' || i == 'skip' || i == 'sort') continue
    Ids = q[i]
    if (Ids && Ids.length > 0) {
      const IDS = Ids.trim().split(',').trim()
      //  && i != 1
      // if (i == "sort") {
      //   this.fl[i] = Ids; // Required: else the sort radio text removes: when sort value
      // } else {
      //   this.fl[i] = Ids.split(",");
      // }
      if (i == 'brands') {
        if (predicate != 'brands') f.push({ brand: { $in: IDS } })
      } else if (i == 'parentBrands') {
        if (predicate != 'parentBrands') f.push({ parentBrand: { $in: IDS } })
      } else if (i == 'genders') {
        if (predicate != 'genders') f.push({ gender: { $in: IDS } })
      } else if (i == 'sizes') {
        if (predicate != 'sizes') f.push({ size: { $in: IDS } })
      } else if (i == 'categories') {
        if (predicate != 'categories')
          f.push({ 'categories.slug': { $in: IDS } })
      } else if (i == 'price') {
        if (predicate != 'price')
          f.push({
            price: {
              $gt: IDS[0],
              $lt: IDS[1],
            },
          })
      } else if (i == 'age') {
        if (predicate != 'age')
          f.push({
            ageMin: {
              $gt: IDS[0],
              $lt: IDS[1],
            },
          })
      } else if (i == 'discount') {
        if (predicate != 'discount')
          f.push({
            discount: {
              $gt: IDS[0],
              $lt: IDS[1],
            },
          })
      } else if (i == 'sort' && predicate != 'sort') {
        q.sort = Ids
      } else if (
        i != 'brands' &&
        i != 'parentBrands' &&
        i != 'genders' &&
        i != 'categories' &&
        i != 'sizes' &&
        i != 'price' &&
        i != 'age' &&
        i != 'discount' &&
        i != 'sort'
      ) {
        if (i != predicate) {
          f.push({
            'features.key': i,
            'features.val': { $in: IDS },
          })
        }
      }
    }
  }
  if (f.length > 0) {
    where = { $and: f }
  } else {
    where = {}
  }
  // log(chalk.red(JSON.stringify(where)));
  let limit = 18
  let skip = 0
  if (q.page) {
    limit = settings.pageSize || 40
    skip = (parseInt(q.page) - 1) * (settings.pageSize || 40)
  }
  const sort = q.sort || { score: { $meta: 'textScore' } }
  where.active = true
  where.approved = true
  where['stock'] = { $gt: 0 }
  let searchString = where
  if (search != 'null') searchString = { ...where, $text: { $search: search } }
  return { where: searchString, limit, skip, sort }
}

//responsible for categorypool field in product , it will receive a product document and then based on field categories
// it will  create field for the categoryPool
export const refreshCategoryPool = async (doc: any) => {
  //make sure category exist in categories array
  if (doc.category) {
    if (!doc.categories) doc.categories = []
    if (!doc.categories.includes(doc.category)) {
      doc.categories.unshift(doc.category)
    }
  }
  //making pool of categories
  if (doc.categories) {
    if (doc.categories.length > 0) {
      let categories: any = []
      for (const c of doc.categories) {
        const cate: any = await Category.findById(c)
        if (cate) {
          //MERGING  ID's ARRAYS
          if (cate.pathA.length > 0) {
            for (const id of cate.pathA) {
              if (id && id !== 'null' && id !== 'undefined') {
                if (!categories.includes(String(id))) {
                  categories.push(String(id))
                }
              }
            }
          }
          if (doc.categories.length > 0) {
            for (const id of doc.categories) {
              if (id && id !== 'null' && id !== 'undefined') {
                if (!categories.includes(String(id))) {
                  categories.push(String(id))
                }
              }
            }
          }
        }
      }
      categories = dedupeIDs(categories)
      categories = unique(categories)
      doc.categoryPool = categories
    } else {
      doc.categoryPool = []
    }
  } else {
    doc.categories = []
    doc.categoryPool = []
  }
  await doc.save()
}
