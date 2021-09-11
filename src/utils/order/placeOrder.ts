import axios from 'axios'
const qs = require('querystring')
// import { calculateOffers } from './promotions'
import { UserInputError } from 'apollo-server-express'
import { Address, Order, OrderItem, Product, Setting, User } from '../../models'
import {
  generateOTP,
  clearCart,
  getSubTotal,
  getTotalQty,
  saveMyCart,
  getTotal,
  calculateSummary,
  validateCart,
  refreshCart,
  groupBy,
  sendMail,
  notifyAdmin,
  notifyCustomer,
} from '../'
import {
  ProductDocument,
  Request,
  UserDocument,
  SettingsDocument,
} from '../../types'
import {
  ORDER_PREFIX,
  ORDER_ITEM_PREFIX,
  TOKEN,
  orderStatuses,
} from '../../config'

//
//initiate order with the order details( order not confirmed in this function)
// id, token, created required for stripe
export const placeOrder = async (
  req: Request,
  { address, comment, id, token, created }: any
) => {
  try {
    //make sure  cart is there and its have at least one item for buy
    await validateCart(req)
    await refreshCart(req)
    // Validates coupon expiry
    if (
      req.session.cart &&
      req.session.cart.discount &&
      req.session.cart.discount.code
    )
      await calculateSummary(req, req.session.cart.discount.code)
    else await calculateSummary(req)
    // console.log('PPPP', req.session.cart)
    const setting: SettingsDocument | null = await Setting.findOne().exec()
    if (!setting) throw new UserInputError('Invalid store configuration')
    if (
      !req.session ||
      !req.session.cart ||
      !req.session.cart.items ||
      req.session.cart.items.length == 0
    )
      throw new UserInputError('No items in cart')
    const { userId, cart } = req.session
    const { cart_id, phone, items, store } = cart
    if (!items || !cart_id) throw new UserInputError('Cart was not found')
    // console.log('Cart Items..........', items)
    if (!items || items.length < 1) throw new UserInputError('Cart is empty.')
    if (!userId) throw new UserInputError('User not found')
    const otp = generateOTP()
    //check address is needed or not, for the orderItems
    let needAddress = false
    if (items.length > 0) {
      for (const i of items) {
        const product: ProductDocument | null = await Product.findById(i.pid)
        if (product) {
          if (product.type == 'physical') needAddress = true
        }
      }
    }
    //in case order have at least one physical item(means address must provide)
    if (needAddress) {
      if (!address)
        throw new Error(
          'please provide address, because cart have physical item'
        )
      address = await Address.findById(address)
      if (!address) throw new Error('Please go back to edit address and update')
      if (!address.address) throw new Error('Address entered is empty')
      if (!address.zip) throw new Error('Pincode is mandatory')
    }
    const itemsList: any = []
    if (items.length > 0) {
      for (const i of items) {
        const item: any = { ...i }
        // If item not found in cart remove it
        const product: ProductDocument | null = await Product.findById(
          i.pid
        ).populate('brand parentBrand size color')
        if (!product) {
          // Remove from cart, don't throw error ::TODO + When a product is removed from database, it must allow to remove the product from cart
          throw new UserInputError('Product not found')
        }
        if (product.type === 'physical') {
          if (product.stock < 1) {
            throw new UserInputError(`Not enough quantity for ${product.name}`)
          }
          if (product.stock - i.qty < 0) {
            throw new UserInputError(`Not enough quantity for ${product.name}`)
          }
        }

        if (!product.vendor) {
          throw new UserInputError('Vendor not found')
        }
        const v: UserDocument | null = await User.findById(product.vendor)
          .select(
            'email phone address firstName lastName address info productSold'
          )
          .exec()
        if (!v) {
          throw new UserInputError('Vendor not found')
        }
        // if (!v.info || !v.info.store)
        //   throw new UserInputError('store info missing')
        const vendorInfo: any = {
          email: v.email, // required during aggregation for delivery boy
          phone: v.phone, // required during aggregation for delivery boy
          address: v.address, // required during aggregation for delivery boy
          firstName: v.firstName, // required during aggregation for delivery boy
          lastName: v.lastName, // required during aggregation for delivery boy
        }
        if (needAddress) {
          const delivery = {
            otp,
            days: 1,
            start:
              vendorInfo.address &&
              vendorInfo.address.lat + ',' + vendorInfo.address.lng,
            finish: address && address.lat + ',' + address.lng,
          }
          //add field in the each item
          item.delivery = delivery
        }
        item.vendor = v
        item.vendorInfo = vendorInfo

        if (product.brand) {
          item.brand = product.brand.id
          item.brandName = product.brand && product.brand.name
          item.brandImg = product.brand && product.brand.img
        }
        if (product.parentBrand) {
          item.parentBrand = product.parentBrand.id
          item.parentBrandName = product.parentBrand && product.parentBrand.name
          item.parentBrandImg = product.parentBrand && product.parentBrand.img
        }
        if (product.color) {
          item.color = product.color.name
        }
        if (product.size) {
          item.size = product.size.name
        }
        item.sku = product.sku
        item.barcode = product.barcode
        item.tax = 0 //product.tax
        item.subtotal = item.price * item.qty
        item.total = item.subtotal + item.shippingCharge + item.tax
        if (orderStatuses) {
          if (orderStatuses.length > 0) {
            //@ts-ignore
            orderStatuses[0].time = new Date()
          }
        }
        item.orderHistory = orderStatuses
        try {
          await product.save()
        } catch (e) {
          console.log('Product ERR::: ', e.toString())
          throw new UserInputError(e.toString())
        }
        await User.findByIdAndUpdate(v._id, {
          $set: { productSold: v.productSold + 1 },
        })
        itemsList.push(item)
        // console.log('vendor', v._id, v.productSold)
      }
    }
    const subtotal = await getSubTotal(itemsList)
    const total = await getTotal(req.session.cart)
    const shipping = cart.shipping.charge
    const discount = cart.discount.amount
    const tax = cart.tax
    const qty = await getTotalQty(itemsList)
    cart.items = items
    cart.subtotal = subtotal
    cart.total = total
    cart.uid = userId
    cart.qty = qty
    req.session.cart = cart
    // await saveMyCart(req.session.cart)
    // console.log('uuuuuuuuuuuuuuuuuuuuuu', userId)
    const me: any = await User.findById(userId)
    // console.log('ssssssssssssssssssssss', me)
    if (!me) throw new UserInputError('Invalid user')
    if (qty < 1) throw new UserInputError('No items in cart')
    const orderNo =
      ORDER_PREFIX + Math.floor(new Date().valueOf() * Math.random()) //nanoid();
    let addressId = undefined
    if (me.address) addressId = me.address[0]
    const orderItems: any = []
    const orderDetails = {
      cartId: req.session.cart.cart_id,
      userFirstName: me.firstName,
      userLastName: me.lastName,
      addressId,
      userPhone: me.phone,
      userEmail: me.email,
      user: userId,
      paymentMode: req.body.variables.paymentMethod, // COD  /online
      paymentTxStatus: 'pending',
      paymentAmount: total,
      platform: 'Mobile',
      orderNo,
      otp,
      address,
      items: itemsList,
      orderItems,
      store,
      amount: {
        total,
        subtotal,
        discount,
        shipping,
        qty,
        tax,
      },
      coupon: cart.discount,
    }
    //lets create orderItems
    for (const item of itemsList) {
      item.itemOrderNo =
        ORDER_ITEM_PREFIX + Math.floor(new Date().valueOf() * Math.random())
      //make seprate item for order
      const orderItem = { ...item, ...orderDetails }
      // console.log('orderItem', orderItem)
      const newOrderItem = new OrderItem(orderItem)
      await newOrderItem.save()
      orderItems.push(newOrderItem._id)
    }
    orderDetails.orderItems = orderItems
    // console.log('orderDetails end of the place Order', orderDetails)
    const o = new Order(orderDetails)
    await o.save()
    //let add orderId into orderItems
    for (let oi of orderItems) {
      let orderItem = await OrderItem.findById(oi)
      let totalDiscount = discount || 0
      let itemDiscount =
        (discount * orderItem.price * orderItem.qty) / subtotal || 0
      oi.orderId = o._id
      await OrderItem.findByIdAndUpdate(oi._id, {
        $set: {
          orderId: o._id,
          totalDiscount: totalDiscount,
          discount: itemDiscount,
          'amount.totalDiscount': totalDiscount,
          'amount.discount': itemDiscount,
        },
      })
    }
    //
    // let result = null
    // const postData = {
    //   order_number: orderNo,
    // }
    // const payload = qs.stringify(postData)
    // try {
    //   result = await axios({
    //     method: 'post',
    //     url: 'http://tablezware-dev.tablez.com/api/v1/order/shipment',
    //     headers: {
    //       'Content-Type': 'application/x-www-form-urlencoded',
    //       Authorization: `Bearer ${TOKEN}`,
    //     },
    //     data: payload,
    //   })
    //   // console.log('res', result)
    // } catch (e) {
    //   console.log('shipment Err::', e.toString())
    // }

    // clear(req)
    await User.updateOne({ _id: userId }, { $set: { address } }).exec() // Save address into user details
    await notifyAdmin({ order: o })
    // await notifyCustomer({ order: o }) // It is handled at order confirmation level
    return o
  } catch (e) {
    throw new Error(e)
  }
}

export const placeOrderViaAdmin = async (
  req: Request,
  { address, comment, id, token, created, userId, items }: any
) => {
  try {
    // price ,shippingCharge and more sync with database
    await refreshCart(req)
    //make sure  cart is there and its have at least one item for buy
    const setting: SettingsDocument | null = await Setting.findOne().exec()
    if (!setting) throw new UserInputError('Invalid store configuration')
    if (!items) throw new UserInputError('Items was not found')
    // console.log('received Items data..........', items)
    if (!items || items.length < 1) throw new UserInputError('Items is empty.')
    const otp = generateOTP()

    const itemsObject: any = [] //store needed fields of each product
    let total = 0 //total amount of all the items
    let totalQty = 0 //total quantity of all the items
    let totalShipping = 0 //total quantity of all the items
    let totalTax = 0
    //check address
    let needAddress = false
    for (const i of items) {
      const product: ProductDocument | null = await Product.findById(i.id)
      if (product) {
        if (product.type == 'physical') needAddress = true
      }
    }
    //in case order have at least one physical item
    if (needAddress) {
      if (!address)
        throw new Error('Physical item present, please provide address. ')
      address = await Address.findById(address)
      if (!address) throw new Error('Please go back to edit address and update')
      if (!address.address) throw new Error('Address entered is empty')
      if (!address.zip) throw new Error('Pincode is mandatory')
    }
    //let's proceed with each product
    for (const i of items) {
      // If item not found in cart remove it
      const product: ProductDocument | null = await Product.findById(
        i.id
      ).populate('brand parentBrand')
      const item: any = {}
      if (!product) {
        // Remove from cart, don't throw error ::TODO + When a product is removed from database, it must allow to remove the product from cart
        throw new UserInputError('Product not found')
      }
      if (product.type === 'physical') {
        if (product.stock < 1) {
          throw new UserInputError(`Not enough quantity for ${product.name}`)
        }
        if (product.stock - i.qty < 0) {
          throw new UserInputError(`Not enough quantity for ${product.name}`)
        }
      }
      if (!product.vendor) {
        throw new UserInputError('Vendor not found')
      }
      const v: UserDocument | null = await User.findById(product.vendor)
        .select(
          'email phone address firstName lastName address info productSold shippingCharges freeShippingOn'
        )
        .exec()
      if (!v) {
        throw new UserInputError('Vendor not found')
      }
      const vendorInfo: any = {
        email: v.email, // required during aggregation for delivery boy
        phone: v.phone, // required during aggregation for delivery boy
        address: v.address, // required during aggregation for delivery boy
        firstName: v.firstName, // required during aggregation for delivery boy
        lastName: v.lastName, // required during aggregation for delivery boy
      }
      const delivery = {
        otp,
        days: 1,
        start:
          vendorInfo.address &&
          vendorInfo.address.lat + ',' + vendorInfo.address.lng,
        finish: address && address.lat + ',' + address.lng,
      }
      //shipping charge on each item
      let shipCharge = 0
      shipCharge = v.shippingCharges
      if (product.price > v.freeShippingOn) shipCharge = 0
      //
      //add field in the each item
      item.delivery = delivery
      item.vendor = v._id
      item.vendorInfo = vendorInfo
      if (product.brand) {
        item.brand = product.brand.id
        item.brandName = product.brand && product.brand.name
        item.brandImg = product.brand && product.brand.img
      }
      if (product.parentBrand) {
        item.parentBrand = product.parentBrand.id
        item.parentBrandName = product.parentBrand && product.parentBrand.name
        item.parentBrandImg = product.parentBrand && product.parentBrand.img
      }
      item.sku = product.sku
      item.barcode = product.barcode
      item.tax = 0 //product.tax
      item.shippingCharge = shipCharge
      item.pid = product._id
      item.vid = product._id
      item.name = product.name
      item.slug = product.slug
      item.img = product.img
      item.price = product.price
      item.qty = i.qty
      item.subtotal = item.price * item.qty
      item.total = item.subtotal + item.shippingCharge + item.tax
      if (orderStatuses) {
        if (orderStatuses.length > 0) {
          //@ts-ignore
          orderStatuses[0].time = new Date()
        }
      }
      item.orderHistory = orderStatuses
      //

      //updating product stock
      if (product.type === 'physical') product.stock = product.stock - i.qty
      try {
        await product.save()
      } catch (e) {
        console.log('Product ERR::: ', e.toString())
        throw new UserInputError(e.toString())
      }
      //update vendor item sold
      await User.findByIdAndUpdate(v._id, {
        $set: { productSold: v.productSold + i.qty },
      })
      //adding product with data
      itemsObject.push(item)
    }
    const vendorWiseItems = groupBy(itemsObject, 'vendor')
    // console.log('zzzzzzzzzzzzzzzzzzzzzzzzzzz', vendorWiseItems)
    for (const vendor in vendorWiseItems) {
      // console.log('vendor', vendor, vendorWiseItems[vendor])
      let vendorAmount = 0
      for (const item of vendorWiseItems[vendor]) {
        vendorAmount = vendorAmount + item.price * item.qty
      }
      const vendorData: any = await User.findById(vendor)
      // console.log('vendor Amount of ', vendor, 'is', vendorAmount)
      // console.log('freeShippingOn and shippingCharges for indivisual',vendorData.freeShippingOn,vendorData.shippingCharges)
      if (vendorAmount >= vendorData.freeShippingOn) {
        // console.log('eligible for free shippping')
        for (const item of itemsObject) {
          if (item.vendor == vendor) {
            item.shippingCharge = 0
          }
          //Logic for get subtotal Price of all products
          const amount = item.price * item.qty
          total += amount
          //logic for totalShipping Charge
          totalShipping = totalShipping + item.shippingCharge
          //logic for totalTax Charge
          totalTax = totalTax + item.tax
        }
      } else {
        // console.log('not eligible for free shippping')
      }
    }
    const subtotal = Math.round(total)
    totalQty = await getTotalQty(items)

    const user: any = await User.findById(userId)
    // console.log('ssssssssssssssssssssss',  subtotal, qty)
    if (!user) throw new UserInputError('Invalid user')
    if (totalQty < 1) throw new UserInputError('No items in cart')
    const orderNo =
      ORDER_PREFIX + Math.floor(new Date().valueOf() * Math.random()) //nanoid();
    let addressId = undefined
    if (user.address) addressId = user.address[0]
    const orderItems: any = []
    const orderDetails = {
      userFirstName: user.firstName,
      userLastName: user.lastName,
      addressId,
      userPhone: user.phone,
      userEmail: user.email,
      user: userId,
      // paymentMode: req.body.variables.paymentMethod, // COD  /online
      paymentTxStatus: 'pending',
      platform: 'Mobile',
      orderNo,
      otp,
      address,
      items: itemsObject,
      orderItems,
      amount: {
        total,
        subtotal,
        shipping: totalShipping,
        qty: totalQty,
        tax: totalTax,
      },
    }
    // console.log('orderDetails end of the place Order', orderDetails)
    //lets create orderItems
    for (const itemObject of itemsObject) {
      itemObject.itemOrderNo =
        ORDER_ITEM_PREFIX + Math.floor(new Date().valueOf() * Math.random())
      //make seprate item for order
      const orderItem = { ...itemObject, ...orderDetails }
      // console.log('orderItem', orderItem)
      const newOrderItem = new OrderItem(orderItem)
      await newOrderItem.save()
      orderItems.push(newOrderItem._id)
    }
    orderDetails.orderItems = orderItems
    let o = new Order(orderDetails)
    o = await o.save()
    //let add orderId into orderItems
    for (let oi of orderItems) {
      oi.orderId = o._id
      await OrderItem.findByIdAndUpdate(oi._id, { $set: { orderId: o._id } })
    }
    //
    // let result = null
    // const postData = {
    //   order_number: orderNo,
    // }
    // const payload = qs.stringify(postData)
    // try {
    //   result = await axios({
    //     method: 'post',
    //     url: 'http://tablezware-dev.tablez.com/api/v1/order/shipment',
    //     headers: {
    //       'Content-Type': 'application/x-www-form-urlencoded',
    //       Authorization: `Bearer ${TOKEN}`,
    //     },
    //     data: payload,
    //   })
    //   // console.log('res', result)
    // } catch (e) {
    //   console.log('shipment Err::', e.toString())
    // }
    // const settings = await Setting.findOne({}).select('websiteName')

    // clear(req)
    await User.updateOne({ _id: userId }, { $set: { address } }).exec() // Save address into user details
    await notifyAdmin({ order: o })
    await notifyCustomer({ order: o })
    return o
  } catch (e) {
    throw new Error(e)
  }
}
