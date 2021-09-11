import { UserInputError } from 'apollo-server-express'
import { Product, Cart, Coupon, Store, User, Brand } from '../../models'
import {
  CartDocument,
  Request,
  ProductDocument,
  CartItemDocument,
  SettingsDocument,
} from '../../types'
import { removeFromCartSession, calculateSummary, groupBy } from '.'

export const addToCart = async (
  req: Request,
  { pid, vid, qty, options, replace }: any
) => {
  vid = pid
  if (
    options != undefined &&
    options != 'undefined' &&
    options != null &&
    options != 'null'
  )
    options = JSON.parse(options)
  else options = []
  // Decided to stick to string version because its easy for both front and backend
  // if (options) {
  //   let optn: any
  //   optn = options
  //   if (optn) optn = Object.entries(optn)
  //   else optn = []
  //   options = []
  //   for (let o of optn) {
  //     options.push({ name: o[0], val: o[1] })
  //   }
  // } else {
  //   options = []
  // }

  // console.log('zzzzzzzzzzzzzzzzzzzzzzzzzzz', options)
  // Req required for accessing session
  //   console.log("this session id " + req.sessionID);
  let product: any = {}
  if (!req.session.cart || !req.session.cart.items)
    req.session.cart = {
      name: 'Arialshop',
      items: [],
      qty: 0,
      shipping: {},
      discount: {},
      subtotal: 0,
      total: 0,
      cart_id: req.session.id,
    }
  let items = req.session.cart.items
  // if (replace) items = req.session.cart.items = []

  if (+qty === -9999999) {
    // When specifically told to remove from cart
    items = removeFromCartSession(items, pid, vid, options)
    await calculateSummary(req)
    // saveMyCart(req.session.cart); // email inside cart is mandatory
    return req.session.cart
  }
  try {
    // Required for stock verification
    product = await Product.findById(pid).select(
      'name slug img price time vendor stock brand barcode tax mrp type store demo'
    )
    // .populate('brand')
    // .populate('vendor') // Removed and handled bellow
    // vid = 0
    if (!product) {
      items = removeFromCartSession(items, pid, vid, options)
      const code = req.session.cart.discount && req.session.cart.discount.code
      await calculateSummary(req, code)
      if (+qty > 0)
        // When addtocart is clicked and product does not exist in cart
        throw new UserInputError('Product Not found')
      // When the requested addToCart item does not exist in database and user is requesting addTocart for the 1st time
      else return req.session.cart
    }
    if (product.demo) throw new UserInputError('This product is a demo product')
  } catch (e) {
    items = removeFromCartSession(items, pid, vid, options)
    throw new UserInputError(e.toString())
  }
  // if (!product) throw new UserInputError('Product not found')
  const {
    name,
    slug,
    price,
    time,
    vendor,
    brand,
    barcode,
    tax,
    mrp,
    type,
    store,
  } = product
  const img = product.img
  // if (!_id || !vendor || !vendor.info) throw new UserInputError('store info missing')
  // if (
  //   req.session.cart.vendor &&
  //   req.session.cart.vendor._id != vendor._id &&
  //   items.length > 0
  // )
  //   throw new UserInputError(
  //     `Your cart contain dishes from ${req.session.cart.vendor.info.store}. Do you wish to Cart cart and add dishes from ${vendor.info.store}?`
  //   )ObjectId("5ea4351c880b0b23119f4c1d")
  const record = items.find((p: CartItemDocument) => {
    // console.log('zzzzzzzzzzzzzzzzzzzzzzzzzzz', p.vid, vid)
    const pv = p.pid === pid && p.vid == vid
    const o: any = JSON.parse(p.options || '{}')
    let matched = true
    if (!o || !o.length) return pv && matched
    for (const k in o) {
      // console.log('oooooooooo', k, o[k], options[k])
      if (o[k] !== options[k]) {
        matched = false
        continue
      }
    }
    return pv && matched
  }) || { qty: 0 }
  // console.log('zzzzzzzzzzzzzzzzzzzzzzzzzzz', req.session.cart.store, store)
  // TODO: Handle different store item
  // if (items.length > 0) {
  //   if (req.session.cart.store != store)
  //     throw new Error('Item not belongs to this store')
  // }
  // console.log('zzzzzzzzzzzzzzzzzz', +product.stock, +record.qty, qty, +qty)
  //check based in product type
  if (type === 'physical') {
    if (+product.stock < +record.qty + qty && +qty > 0)
      throw new UserInputError('Not enough stock')
  }

  // let itemVendor: any = null,
  //   itemStore: any = null
  // let shipCharge = 0
  // try {
  //   itemVendor = await User.findById(vendor)
  //   itemStore = await Store.findById(store)
  //   shipCharge = itemStore.shippingCharge
  //   if (price > itemStore.freeShippingOn) shipCharge = 0
  // } catch (e) {
  //   throw new UserInputError('Vendor Not Found.')
  // }

  let itemBrand: any = null
  let brandName: any
  if (brand) itemBrand = await Brand.findById(brand)
  if (itemBrand) brandName = itemBrand.name

  if (record.qty) {
    // console.log('if record already exist', pid, vid, qty)
    // console.log('Not in cart', options)
    // If the product is already there in cart increase qty
    // if (+record.qty < 2) qty = 1
    record.qty = +record.qty + +qty
    if (+record.qty < 1) {
      // When stock not enough remove it from cart
      items = removeFromCartSession(items, pid, vid, options)
    }
  } else if (qty > 0) {
    // console.log('First time ', pid, vid, qty, brand)
    items.push({
      pid,
      vid,
      barcode,
      options: JSON.stringify(options),
      name,
      type,
      slug,
      img,
      qty,
      price,
      mrp,
      time,
      tax,
      shippingCharge: 0,
      brand,
      brandName,
      vendor,
      // vendorFirstName: itemVendor.firstName,
      // vendorLastName: itemVendor.lastName,
      // vendorPhone: itemVendor.phone,
    })
  }
  // console.log('Last Step of addToCart', req.session.cart.items)
  // req.session.cart.items = []
  // req.session.cart.vendor = vendor
  if (store) req.session.cart.store = store
  const code = req.session.cart.discount && req.session.cart.discount.code
  await calculateSummary(req, code)
  const cookie = req.headers.cookie || ''
  req.session.cart.sid = cookie
  return req.session.cart
}
