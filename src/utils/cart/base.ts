import { UserInputError } from 'apollo-server-express'
import { Product, Cart, Coupon, Setting, User, Store } from '../../models'
import {
  CartDocument,
  Request,
  ProductDocument,
  CartItemDocument,
  SettingsDocument,
} from '../../types'
import {
  addToCart,
  getTotalQty,
  getSubTotal,
  getTotalTax,
  getTotalShipping,
  groupBy,
} from '.'

//this function will save or update cart into Database
export const saveMyCart = async (cart: CartDocument) => {
  const { qty, uid } = cart
  // Silent. no error or success
  if (qty == 0) {
    await Cart.deleteOne({ uid })
  } else {
    let c = await Cart.findOneAndUpdate({ uid }, cart, {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
      runValidators: true,
    }).exec()
  }
}

export const clearCart = async (req: Request) => {
  if (!req.session.cart) req.session.cart = {}
  req.session.cart.items = []
  req.session.cart.discount = {}
  await calculateSummary(req)
}

//cart merge function
export const merge = async (req: Request) => {
  try {
    const uid = req.session.userId
    if (!uid) return
    let dbCart = await Cart.findOne({ uid })
    if (dbCart) {
      let items = dbCart.items
      if (items.length > 0) {
        const promises = items.map(async (i) => {
          await addToCart(req, {
            pid: String(i.pid),
            // vid: i.vid,
            options: i.options,
            // vendor: i.vendor,
            qty: i.qty,
          })
        })
        await Promise.all(promises)
      }
    }

    req.session.cart = req.session.cart || {}
    req.session.cart.uid = uid
    await saveMyCart(req.session.cart) // email inside cart is mandatory
  } catch (e) {}
  return req.session.cart
}

//this function will remove item from cart session
export const removeFromCartSession = (
  items: [CartItemDocument],
  pid: string,
  vid: string,
  options: string
) => {
  if (!items || !items.length) return []

  for (var i = 0; i < items.length; i++) {
    if (items[i].pid === pid && items[i].vid === vid) {
      items.splice(i, 1)
    }
  }
  // req.session.cart.items = items
  // await saveMyCart(req.session.cart)
  return items
}

export const applyDiscount = (
  subtotal: number,
  value: number,
  minimumCartValue: number,
  maxAmount: number,
  type: string
): number => {
  let amount: number = 0
  if (!subtotal || subtotal < 1 || subtotal < minimumCartValue) return 0
  if (type.toLowerCase() === 'percent')
    amount = Math.floor(subtotal * (value / 100))
  else if (type.toLowerCase() === 'fixed' || type.toLowerCase() === 'flat')
    amount = value
  if (amount > maxAmount) amount = maxAmount
  return amount
}

// Also called from Coupon Controller
export const validateCart = async (req: Request) => {
  const { session } = req
  if (!session) throw new UserInputError('Cart not initiated')
  const { cart } = session
  // console.log('validateCart...Cart is empty.......', cart)
  if (!cart) throw new UserInputError('Cart is empty')
  let { items } = cart
  if (!items || items.length < 1) items = [] //throw new UserInputError('No items in cart')
  cart.qty = getTotalQty(items)
  let subtotal = (cart.subtotal = await getSubTotal(items))
  const setting: any = (await Setting.findOne({})
    .select('shipping tax minimumOrderValue')
    .exec()) || {
    minimumOrderValue: 0,
    shipping: { charge: 0 },
    // tax: { cgst: 0, sgst: 0, igst: 0 },
    tax: 0,
  }
  if (subtotal < setting.minimumOrderValue)
    throw new UserInputError('Min order value is ' + setting.minimumOrderValue)
}

export const validateCoupon = async (
  cart: CartDocument,
  code?: string,
  silent?: boolean
) => {
  cart.qty = getTotalQty(cart.items)
  let subtotal = (cart.subtotal = await getSubTotal(cart.items))
  let coupon = await Coupon.findOne({
    code,
    active: true,
    validFromDate: { $lte: new Date() },
    validToDate: { $gte: new Date() },
  })
    .select(
      'code color type text terms value minimumCartValue amount maxAmount validFromDate validToDate'
    )
    .exec()
  if (code) {
    if (!silent) {
      if (!coupon) throw new UserInputError('The selected coupon is expired.')
      // code is required here because when no coupon is applied this should not throw error
      else if (coupon.minimumCartValue > cart.subtotal)
        throw new UserInputError(
          'Can not apply coupon, add some more items to cart.'
        ) // code is required here because when no coupon is applied this should not throw error
    } else {
      if (coupon)
        applyDiscount(
          subtotal,
          coupon.value,
          coupon.minimumCartValue,
          coupon.maxAmount,
          coupon.type
        )
    }
  }

  if (coupon && coupon.value) {
    coupon.amount = await applyDiscount(
      cart.subtotal,
      coupon.value,
      coupon.minimumCartValue,
      coupon.maxAmount,
      coupon.type
    )
    return coupon
  } else {
    return { amount: 0 }
  }
}

//function used for update totalQty, cart Subtotal, totalTax, totalShipping
export const calculateSummary = async (req: Request, code?: string) => {
  // Other validations moved to separate function named validateCart because when cart is cleared, validate cart will throw error of minimumordervalue + cart is empty
  const { session } = req
  let { cart, userId, id } = session
  if (!cart) cart = {} //throw new UserInputError('No items in cart')
  let { items = [] } = cart
  cart.qty = getTotalQty(items)
  let subtotal = (cart.subtotal = await getSubTotal(items))
  let shipping,
    tax,
    minimumOrderValue = 0
  const setting: any = (await Setting.findOne({})
    .select('shipping tax minimumOrderValue')
    .exec()) || {
    minimumOrderValue: 0,
    shipping: { charge: 0 },
    tax: 0,
    // tax: { cgst: 0, sgst: 0, igst: 0 },
  }
  // Can not use try catch here, it will not fire the following UserInputError
  const discount = await validateCoupon(cart, code, true) // 3rd param true= Silent no error
  cart.shipping = cart.shipping || {}
  shipping = cart.shipping
  // if (!shipping || !shipping.charge) shipping.charge = 0
  shipping.charge = await getTotalShipping(items)
  cart.shipping.charge = shipping.charge
  cart.discount = discount
  let total = +subtotal - +discount.amount + +shipping.charge
  // tax = setting.tax
  // cart.tax = {
  //   cgst: (total * +tax.cgst) / 100,
  //   sgst: (total * +tax.sgst) / 100,
  //   igst: (total * +tax.igst) / 100,
  // }
  // cart.total = total + total * (+tax.cgst + +tax.sgst + +tax.igst) * 0.01
  tax = 0 // await getTotalTax(items)
  cart.tax = tax
  cart.total = total + +total * +tax * 0.01
  // console.log('zzzzzzzzzzzzzzzzzzzzzzzzzzz', cart.total)
  cart.uid = userId
  cart.cart_id = id
  req.session.cart = cart
  await saveMyCart(req.session.cart)
}

//function will refresh the cart things like (shipping charge,total,subtotal, price ,)
export const refreshCart = async (req: Request) => {
  let cart = req.session.cart || {}
  let product: any = {}
  let items = cart.items || []
  let cartItems = cart.items || []
  let cartStore = null
  const settings = await Setting.findOne()
  if (!settings) throw new Error('Something went wrong')
  //check store or vendor
  if (settings.isMultiStore) {
    if (req.session.cart.store)
      cartStore = await Store.findById(req.session.cart.store)
  }
  if (cartItems.length > 0) {
    for (let item of cartItems) {
      try {
        product = await Product.findById(item.pid).select(
          'name slug img price time vendor stock brand barcode tax mrp store'
        )
        // .populate('brand')
        if (!product) {
          //product not available so removed from cart
          items = removeFromCartSession(items, item.pid, item.vid, item.options)
          const code = cart.discount && cart.discount.code
          await calculateSummary(req, code)
          return cart
        }
      } catch (e) {
        items = removeFromCartSession(items, item.pid, item.vid, item.options)
        throw new UserInputError(e.toString())
      }
      const { price, vendor, tax, mrp, store } = product
      //sync store with shipping charge
      let itemVendor: any = null,
        shipCharge = 0
      if (settings.isMultiStore) {
        if (!cartStore) cartStore = await Store.findById(store)
        if (!cartStore) throw new Error('Store not found')
        shipCharge = cartStore.shippingCharge
        if (price > cartStore.freeShippingOn) shipCharge = 0
      } else {
        try {
          itemVendor = await User.findById(vendor)
          shipCharge = itemVendor.shippingCharges
          if (price > itemVendor.freeShippingOn) shipCharge = 0
        } catch (e) {
          throw new UserInputError('Vendor Not Found.')
        }
      }

      //update price ,shipping charge, mrp
      item.shippingCharge = shipCharge
      item.price = price
      item.mrp = mrp
      item.tax = 0 //tax
    }
  }
  //logic for free shipping eligibility
  if (settings.isMultiStore) {
    //CURRENT(store items)
    let subTotal = await getSubTotal(cartItems)
    let totalQty = await getTotalQty(cartItems)
    if (subTotal >= cartStore.freeShippingOn) {
      // console.log('eligible for free shippping')
      for (let item of items) {
        item.shippingCharge = 0
      }
    } else {
      // console.log('not eligible for free shippping')
      for (let item of items) {
        item.shippingCharge = (item.shippingCharge / totalQty) * item.qty
      }
    }
  } else {
    //OLD(vendorWiseItems)
    const vendorWiseItems = groupBy(items, 'vendor')
    if (vendorWiseItems) {
      for (let vendor in vendorWiseItems) {
        let vendorAmount = 0
        let vendorTotalQty = 0
        for (let item of vendorWiseItems[vendor]) {
          vendorAmount = vendorAmount + item.price * item.qty
          vendorTotalQty = vendorTotalQty + item.qty
        }
        let vendorData: any = await User.findById(vendor)
        if (vendorAmount >= vendorData.freeShippingOn) {
          // console.log('eligible for free shippping')
          for (let item of items) {
            if (item.vendor == vendor) {
              item.shippingCharge = 0
            }
          }
        } else {
          // console.log('not eligible for free shippping')
          for (let item of items) {
            if (item.vendor == vendor) {
              item.shippingCharge =
                (item.shippingCharge / vendorTotalQty) * item.qty
            }
          }
        }
      }
    }
  }

  const code = cart.discount && cart.discount.code
  await calculateSummary(req, code)
  const cookie = req.headers.cookie || ''
  cart.sid = cookie
  await saveMyCart(cart)
}
