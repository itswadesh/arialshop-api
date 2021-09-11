import { UserInputError } from 'apollo-server-express'
import { ORDER_FLOW_QUEUE_NAME, ORDER_POPULARITY_VAL } from '../../config'
import { Order, OrderItem, Product, Setting, Cart } from '../../models'
import { ProductDocument } from '../../types'
import { sendMail } from '../email'
import { insertServiceBusQueue } from '../messageQueue'
import { orderSMS } from './'
import { confirmOrderServiceBusHook } from '../hooks'

export const getData = async (start: Date, end: Date, q: any) => {
  const data = await Order.aggregate([
    {
      $match: {
        ...q,
        status: { $nin: ['Cancelled'] },
        createdAt: { $gte: start, $lte: end },
      },
    },
    { $unwind: '$items' },
    { $project: { items: 1, createdAt: 1, vendor: 1, updatedAt: 1 } },
    {
      $group: {
        _id: {
          date: {
            $dateToString: {
              format: '%d-%m-%Y',
              date: '$createdAt',
              timezone: '+0530',
            },
          },
        },
        items: {
          $addToSet: {
            pid: '$items.pid',
            img: '$items.img',
            slug: '$items.slug',
            name: '$items.name',
            price: '$items.price',
            // updatedAt: { $max: '$updatedAt' }, // This will not preserve uniqueness
            time: '$items.time',
            type: '$items.type',
            ratings: '$items.ratings',
            reviews: '$items.reviews',
            store: '$vendor.store',
          },
        },
        count: { $sum: '$amount.qty' },
        amount: { $sum: '$amount.subtotal' },
      },
    },
    { $sort: { count: -1 } },
  ])
  return data
}

export const updateOrderStats = async (orderId) => {
  const orderItems = await OrderItem.find({ orderId })
  for (const i of orderItems) {
    const product = await Product.findById(i)
    if (product) {
      await Product.updateOne(
        { _id: i._id },
        {
          $set: {
            popularity: +product.popularity + ORDER_POPULARITY_VAL,
            stock: +product.stock - +i.qty,
          },
        }
      )
    }
  }
}

// in case order confirmed(in case only work on order and payment , dont need)
export const confirmOrder = async (orderId) => {
  try {
    const order = await Order.findById(orderId)
    if (!order) throw new UserInputError('Order not found')
    //updating product stock
    for (let item of order.items) {
      let product = await Product.findById(item.pid)
      if (product) {
        if (product.type === 'physical') {
          product.stock = product.stock - item.qty
          await product.save()
        }
      }
    }
    await Order.findByIdAndUpdate(orderId, { $set: { paid: true } })

    //servcice bus
    await confirmOrderServiceBusHook(order.orderNo)

    const settings = await Setting.findOne()
    sendMail({
      to: order.userEmail,
      subject: settings.websiteName + ' Order Placed Successfully',
      template: 'order/created',
      context: {
        orderNo: order.orderNo,
        createdAt: order.createdAt,
        items: order.items,
        amount: order.amount,
        address: order.address,
      },
    })
    await Cart.deleteOne({ uid: order.user })

    await updateOrderStats(order.id)
    // clearCart(req)
    orderSMS(order) //send confirmattion to user
  } catch (e) {
    console.log('Confirm Order error...........', e)
  }
}

export const updateStats = async (product: ProductDocument) => {
  // const reviews = await Review.aggregate([
  //   { $match: { product: product._id } },
  //   {
  //     $group: {
  //       _id: '$product',
  //       avg: { $avg: '$rating' },
  //       count: { $sum: 1 },
  //     },
  //   },
  // ])
  // const vendorReviews = await Review.aggregate([
  //   { $match: { vendor: product.vendor } },
  //   {
  //     $group: {
  //       _id: '$vendor',
  //       avg: { $avg: '$rating' },
  //       count: { $sum: 1 },
  //     },
  //   },
  // ])
  // await User.findByIdAndUpdate(product.vendor, {
  //   ratings: Math.round(vendorReviews[0].avg * 10) / 10,
  //   reviews: vendorReviews[0].count,
  // })
  // const orders = await Order.countDocuments({ 'items.pid': product._id })
  // if (reviews.length > 0) {
  //   await Product.updateOne(
  //     { _id: product._id },
  //     {
  //       $set: {
  //         ratings: Math.round(reviews[0].avg * 10) / 10,
  //         reviews: reviews[0].count,
  //         sales: orders,
  //       },
  //     }
  //   )
  // }
}
