const qs = require('querystring')
import dayjs from 'dayjs'
import { signForVerification } from '../pay/helpers-cashfree/cashfreeSignatureUtil'
import { transactionStatusEnum } from '../pay/helpers-cashfree/enums'
import {
  IResolvers,
  UserInputError,
  ForbiddenError,
} from 'apollo-server-express'
import {
  Request,
  PaymentDocument,
  ProductDocument,
  OrderDocument,
  OrderItemDocument,
  RefundDocument,
} from '../types'
import { objectId } from '../validation'
import {
  CASHFREE_APPID,
  CASHFREE_SECRET_KEY,
  MERCHANT_KEY,
  MID,
  PAY_MESSAGE,
  RAZORPAY_KEY_ID,
  RAZORPAY_KEY_SECRET,
  STRIPE_SECRET_KEY,
  WWW_URL,
  TOKEN,
  ORDER_RETURN_QUEUE_NAME,
  PAYPAL_CLIENT_ID,
  PAYPAL_CLIENT_SECRET,
} from '../config'
import {
  Order,
  OrderItem,
  Payment,
  Product,
  Refund,
  Setting,
  Store,
  User,
} from '../models'
import {
  placeOrder,
  confirmOrder,
  fields,
  index,
  clearCart,
  insertServiceBusQueue,
  getServiceBusQueue,
  orderRefundServiceBusHook,
} from '../utils'
const Razorpay = require('razorpay')
import { sign } from '../pay/helpers-cashfree/cashfreeSignatureUtil'
import axios from 'axios'
const stripe = require('stripe')(STRIPE_SECRET_KEY)
const Paytm = require('paytm-pg-node-sdk')
const paypal = require('paypal-rest-sdk')

paypal.configure({
  mode: 'sandbox', //sandbox or live
  client_id: PAYPAL_CLIENT_ID || 'PAYPAL_CLIENT_ID',
  client_secret: PAYPAL_CLIENT_SECRET || 'PAYPAL_CLIENT_SECRET',
})

//TODO: switch below methods to use value cleaner
const razorpayInstance = new Razorpay({
  key_id: RAZORPAY_KEY_ID || 'RAZORPAY_KEY_ID',
  key_secret: RAZORPAY_KEY_SECRET || 'RAZORPAY_KEY_SECRET',
})

const resolvers: IResolvers = {
  Query: {
    payments: async (root, args, { req }: { req: Request }, info) => {
      const { userId } = req.session
      const user = await User.findById(userId)
      if (!user) throw new UserInputError('You are not authorized')
      if (user.role != 'admin') args['items.vendor'] = userId
      //checking store
      const settings = await Setting.findOne()
      if (!settings) throw new Error('Something went wrong')
      let isMultiStore = false
      if (settings.isMultiStore) {
        isMultiStore = true
        args.populate = 'store'
      }
      return index({ model: Payment, args, info, isMultiStore })
    },
    payment: async (
      root,
      args: { id: string },
      ctx,
      info
    ): Promise<PaymentDocument | null> => {
      await objectId.validateAsync(args)
      return Payment.findById(args.id, fields(info)).populate('store')
    },
    razorpays: async (root, args, ctx, info): Promise<PaymentDocument[]> => {
      const payments = await razorpayInstance.payments.all()
      payments.data = payments.items
      return payments
    },
  },
  Mutation: {
    stripe: async (
      root,
      args: { token: any; address: string },
      { req }
    ): Promise<PaymentDocument> => {
      const uid = req.session.userId
      const user = await User.findById(uid)
      if (!args.token) {
        throw new UserInputError('You must enter your credit card number')
      }
      const token = args.token
      // const id = nanoid();
      if (!user) throw new UserInputError('Not logged in')
      const email = user.email
      const phone = user.phone
      if (!token || token == '') {
        throw new UserInputError('Stripe token is necessary')
      }
      try {
        const settings: any = await Setting.findOne({})
        const newOrder: any = await placeOrder(req, {
          address: args.address,
        })
        // const customer:any = await stripe.customers.create({ email })
        const amount = Math.round(newOrder.amount.total * 100)
        let store
        if (newOrder.store) store = newOrder.store
        const charge: any = await stripe.charges.create({
          amount, // Must be in cents
          currency: settings.currencyCode,
          description: 'Paid for shopping @ ' + settings.websiteName,
          source: token,
          metadata: {
            order_id: newOrder._id.toString(),
            orderNo: newOrder.orderNo,
            email,
            phone,
            amount,
            token,
          },
          receipt_email: email,
          store,
        })
        const created = new Date(0) // The 0 there is the key, which sets the date to the epoch
        created.setUTCSeconds(charge.created)
        if (charge.captured) {
          charge.amount_paid = charge.amount
          charge.amount_due = 0
          //for insert in bus and messaage
          await confirmOrder(newOrder.id)
        } else {
          charge.amount_paid = 0
          charge.amount_due = charge.amount
        }
        console.log('charge', charge)
        const c = await Payment.create(charge)
        await Order.findByIdAndUpdate(charge.metadata.order_id, {
          $set: { payment: c._id },
        })
        //for orderitem update
        await OrderItem.updateMany(
          { orderId: charge.metadata.order_id },
          { $set: { payment: c._id } }
        )

        return newOrder
      } catch (err) {
        throw new UserInputError(err)
      }
    },
    stripePayNow: async (root, args, { req }): Promise<any> => {
      const { userId } = req.session
      const me: any = await User.findById(userId)
      if (!me) throw new UserInputError('User not found')
      try {
        let newOrder: any = null
        try {
          newOrder = await placeOrder(req, { address: args.address })
        } catch (e) {
          console.log('Place Order Err::: ', e)
          throw new UserInputError(e)
        }
        const settings = await Setting.findOne({})
        const customerName =
          newOrder.address.userFirstName ||
          newOrder.userFirstName ||
          settings.websiteName
        const customerPhone =
          newOrder.address.phone || newOrder.userPhone || '9999999999'
        const customerEmail =
          newOrder.address.email || newOrder.userEmail || 'hi@litekart.in'
        const postData = {
          amount: newOrder.amount.total, // orderAmount
          currency: settings.currencyCode,
        }
        // Create a PaymentIntent with the order amount and currency
        const paymentIntent = await stripe.paymentIntents.create(postData)
        // console.log('clientSecret is:', paymentIntent.client_secret)

        const paymentMode = 'online',
          paymentGateway = 'stripe',
          invoiceId = newOrder._id,
          receipt = newOrder.cartId.toString(),
          orderId = newOrder._id.toString(),
          amountPaid = 0,
          amountDue = postData.amount,
          currency = postData.currency,
          clientSecret = paymentIntent.client_secret,
          status = paymentIntent.status
        let store
        if (newOrder.store) store = newOrder.store
        const payment = await Payment.create({
          paymentMode,
          paymentGateway,
          invoiceId,
          receipt,
          orderId,
          amountPaid,
          amountDue,
          currency,
          clientSecret,
          status,
          email: customerEmail,
          contact: customerPhone,
          customerName,
          store,
        })
        await Order.findByIdAndUpdate(
          newOrder._id,
          {
            $set: {
              paymentMode,
              paymentGateway,
              invoiceId,
              receipt,
              orderId,
              amountPaid,
              amountDue,
              currency,
              payment: payment._id,
            },
          },
          { new: true }
        )
        //for orderitem update
        await OrderItem.updateMany(
          { orderId: newOrder._id },
          {
            $set: {
              paymentMode,
              paymentGateway,
              invoiceId,
              receipt,
              orderId,
              amountPaid,
              amountDue,
              currency,
              payment: payment._id,
            },
          }
        )
        console.log('paymentIntent', paymentIntent)
        // return derivedSignature
      } catch (e) {
        throw new Error(e)
      }
    },
    razorpay: async (
      root,
      args: { address: any },
      { req }
    ): Promise<PaymentDocument> => {
      let newOrder: any = null
      try {
        newOrder = await placeOrder(req, { address: args.address })
      } catch (e) {
        console.log('Place Order Err::: ', e)
        throw new UserInputError(e)
      }
      const amount = Math.round(newOrder.amount.total * 100)
      const postData: any = {
        amount,
        payment_capture: true,
        currency: 'INR',
        receipt: newOrder.cartId.toString(),
        notes: { phone: newOrder.userPhone, purpose: PAY_MESSAGE },
      }

      const payment = await razorpayInstance.orders.create(postData)
      payment.invoice_id = newOrder._id
      payment.paymentOrderId = payment.id
      let store
      if (newOrder.store) store = newOrder.store
      const pay = await Payment.create({
        paymentMode: 'online',
        paymentGateway: 'razorpay',
        invoice_id: newOrder._id,
        receipt: newOrder.cartId.toString(),
        order_id: newOrder._id.toString(),
        amount: postData.orderAmount,
        currency: postData.orderCurrency,
        signature: postData.signature,
        store,
      })
      // console.log('zzzzzzzzzzzzzzzzzzzzzzzzzzz', pay._id)
      await Order.findByIdAndUpdate(
        newOrder._id,
        {
          $set: {
            payment: pay._id,
            paymentMode: 'online',
            paymentGateway: 'razorpay',
            paymentOrderId: payment.id,
            paymentCurrency: postData.currency,
            paymentAmount: postData.amount,
          },
        },
        { new: true }
      )
      //for orderitem update
      await OrderItem.updateMany(
        { orderId: newOrder._id },
        {
          $set: {
            payment: pay._id,
            paymentMode: 'online',
            paymentGateway: 'razorpay',
            paymentOrderId: payment.id,
            paymentCurrency: postData.currency,
            paymentAmount: postData.amount,
          },
        }
      )
      payment.key_id = RAZORPAY_KEY_ID
      return payment
    },
    capturePay: async (
      root,
      args: { paymentId: string; oid: string },
      { req }: { req: Request },
      info
    ): Promise<OrderDocument> => {
      const o = await Order.findOne({ paymentOrderId: args.oid })
      if (!o) throw new UserInputError('Order not found. Please try again')
      const payment = await razorpayInstance.payments.fetch(args.paymentId)
      //in case amount captured
      if (payment.status == 'captured') {
        payment.amountPaid = payment.amount
        payment.amountDue = 0
        //for insert in bus and messaage
        await confirmOrder(o._id)
      } else {
        payment.amountPaid = 0
        payment.amountDue = payment.amount
      }
      await Order.updateOne({ paymentOrderId: args.oid }, { $set: { payment } })
      //also update in orderItem
      const orderItems = await OrderItem.find({ paymentOrderId: args.oid })
      for (let item of orderItems) {
        await OrderItem.findByIdAndUpdate(item._id, { $set: { payment } })
      }

      await Payment.findByIdAndUpdate(o.payment, { $set: payment })

      for (const i of o.items) {
        const p: ProductDocument | null = await Product.findById(i)
        if (p) {
          await Product.updateOne(
            { _id: i._id },
            {
              $set: {
                popularity: +p.popularity + 10,
                stock: +p.stock - +i.qty,
              },
            }
          ) // Reduce stock for that
        }
      }
      clearCart(req)
      return o
    },

    paytmPayNow: async (root, args, { req }): Promise<boolean> => {
      const { userId } = req.session
      const newOrder: any = await placeOrder(req, { address: args.address })
      // try {
      const amount = Math.round(newOrder.amount.total * 100)
      // console.log('zzzzzzzzzzzzzzzzzz', {
      //   amount,
      //   payment_capture: true,
      //   currency: 'INR',
      //   receipt: newOrder.cartId.toString(),
      //   notes: { phone: newOrder.user.phone, purpose: PAY_MESSAGE },
      // })

      const environment = Paytm.LibraryConstants.STAGING_ENVIRONMENT
      const mid = MID
      const key = MERCHANT_KEY
      const website = 'WEBSTAGING'
      const client_id = 'YOUR_CLIENT_ID_HERE'

      const callbackUrl = 'http://localhost:3000/callback'
      Paytm.MerchantProperties.setCallbackUrl(callbackUrl)

      Paytm.MerchantProperties.initialize(
        environment,
        mid,
        key,
        client_id,
        website
      )
      // If you want to add log file to your project, use below code
      Paytm.Config.logName = '[PAYTM]'
      Paytm.Config.logLevel = Paytm.LoggingUtil.LogLevel.INFO
      Paytm.Config.logfile = '/path/log/file.log'
      //
      const channelId = Paytm.EChannelId.WEB
      const orderId = 'TEST_'
      const txnAmount = Paytm.Money.constructWithCurrencyAndValue(
        Paytm.EnumCurrency.INR,
        '1.00'
      )
      const userInfo = new Paytm.UserInfo('CUSTOMER_ID')
      userInfo.setAddress('CUSTOMER_ADDRESS')
      userInfo.setEmail('CUSTOMER_EMAIL_ID')
      userInfo.setFirstName('CUSTOMER_FIRST_NAME')
      userInfo.setLastName('CUSTOMER_LAST_NAME')
      userInfo.setMobile('CUSTOMER_MOBILE_NO')
      userInfo.setPincode('CUSTOMER_PINCODE')
      const paymentDetailBuilder = new Paytm.PaymentDetailBuilder(
        channelId,
        orderId,
        txnAmount,
        userInfo
      )
      const paymentDetail = paymentDetailBuilder.build()
      const response = await Paytm.Payment.createTxnToken(paymentDetail)
      console.log('res', response)
      return true
    },
    paytmCapturePay: async (root, args, { req }): Promise<boolean> => {
      const orderId = args.orderId
      const readTimeout = 80000
      const paymentStatusDetailBuilder = new Paytm.PaymentStatusDetailBuilder(
        orderId
      )
      const paymentStatusDetail = paymentStatusDetailBuilder
        .setReadTimeout(readTimeout)
        .build()
      const response = Paytm.Payment.getPaymentStatus(paymentStatusDetail)
      //for insert in bus and messaage based in payement status
      await confirmOrder(args.orderId)
      console.log('res', response)
      return true
    },
    cashfreePayNow: async (root, args, { req }): Promise<any> => {
      const { userId } = req.session
      const me: any = await User.findById(userId)
      if (!me) throw new UserInputError('User not found')
      // const WWW_URL = req.headers.origin
      // console.log('WWW_URL.................', WWW_URL)
      // const { userId } = req.session
      let newOrder: any = null
      try {
        newOrder = await placeOrder(req, { address: args.address })
      } catch (e) {
        console.log('Place Order Err::: ', e)
        throw new UserInputError(e)
      }
      const settings = await Setting.findOne({})
      const customerName =
        newOrder.address.userFirstName ||
        newOrder.userFirstName ||
        settings.websiteName
      const customerPhone =
        newOrder.address.phone || newOrder.userPhone || '9999999999'
      const customerEmail =
        newOrder.address.email || newOrder.userEmail || 'hi@litekart.in'
      const postData: any = {
        appId: CASHFREE_APPID,
        orderId: newOrder.id,
        orderAmount: newOrder.amount.total,
        orderCurrency: settings.currencyCode,
        orderNote: `Payment for shopping at ${settings.websiteName}`,
        customerName,
        customerPhone,
        customerEmail,
        returnUrl: `${WWW_URL}/api/pay/capture-cashfree`,
        notifyUrl: `${WWW_URL}/api/pay/notify-cashfree`,
      }
      const derivedSignature = await sign(postData) // This is a object
      const paymentMode = 'online',
        paymentGateway = 'cashfree',
        invoiceId = newOrder._id,
        receipt = newOrder.cartId.toString(),
        orderId = newOrder._id.toString(),
        amountPaid = 0,
        amountDue = postData.orderAmount,
        currency = postData.orderCurrency,
        signature = postData.signature
      let store
      if (newOrder.store) store = newOrder.store
      const payment = await Payment.create({
        paymentMode,
        paymentGateway,
        invoiceId,
        receipt,
        orderId,
        amountPaid,
        amountDue,
        currency,
        signature,
        email: customerEmail,
        contact: customerPhone,
        customerName,
        store,
      })
      await Order.findByIdAndUpdate(
        newOrder._id,
        {
          $set: {
            paymentMode,
            paymentGateway,
            invoiceId,
            receipt,
            orderId,
            amountPaid,
            amountDue,
            currency,
            signature,
            payment: payment._id,
          },
        },
        { new: true }
      )
      //for orderitem update
      await OrderItem.updateMany(
        { orderId: newOrder._id },
        {
          $set: {
            paymentMode,
            paymentGateway,
            invoiceId,
            receipt,
            orderId,
            amountPaid,
            amountDue,
            currency,
            signature,
            payment: payment._id,
          },
        }
      )
      return derivedSignature
    },
    //this is used for payement status
    cashfreeCapturePay: async (root, args, { req }): Promise<boolean> => {
      // Implemented at /src/pay/cashfree
      //referenceId: unique transaction ID
      // txStatus: SUCCESS, FLAGGED, PENDING, FAILED, CANCELLED, USER_DROPPED
      // paymentMode: 'https://dev.cashfree.com/payment-gateway/payments#payment-modes'
      return true
    },
    OrderRefund: async (root, args, { req }): Promise<OrderItemDocument> => {
      const { amount, email, note, orderItemId, password, qty } = args
      const user = await User.findOne({ email })
      if (!user || !(await user.matchesPassword(password))) {
        throw new UserInputError('Incorrect email or password')
      }
      if (user.role != 'admin')
        throw new UserInputError('Only admin can access this route')
      const orderItem = await OrderItem.findById(orderItemId).populate(
        'payment'
      )
      if (!orderItem) throw new Error('Order Item not found')
      //check passsed qty is valid
      if (qty > orderItem.qty) throw new Error('Invalid quantity')
      //look setting
      const settings = await Setting.findOne()
      if (!settings) throw new Error('Settings not found')
      const stage = settings.paymentStage || 'PROD'
      let refund_url = 'TEST'
      if (stage == 'PROD') {
        refund_url = 'https://api.cashfree.com/api/v1/order/refund'
      } else {
        refund_url = 'https://test.cashfree.com/api/v1/order/refund'
      }
      let refreneceId = null
      if (orderItem.payment) {
        if (orderItem.payment.referenceId)
          refreneceId = orderItem.payment.referenceId
      }
      const postData = {
        appId: CASHFREE_APPID,
        secretKey: CASHFREE_SECRET_KEY,
        orderId: orderItem.orderId,
        referenceId: refreneceId, //'1001982' for test u can send it
        refundAmount: amount, //give error if amt > orderAmt ('Total refund cannot be greater than the refundable amount')
        refundNote: note,
        orderAmount: orderItem.total,
        orderCurrency: orderItem.currency,
      }

      const payload = qs.stringify(postData)
      let result = null
      let refundData: any = {}
      let refund: RefundDocument | null
      try {
        result = await axios({
          method: 'post',
          url: refund_url,
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          data: payload,
        })
        // console.log('response', result)
        //if u face auth error , make sure hit the test url (not prod)
        if (result.data) {
          if (result.data.refundId) {
            refundData.amount = amount
            refundData.message = result.data.message
            refundData.qty = qty
            refundData.refundId = result.data.refundId
            refundData.time = dayjs()
            refund = await Refund.create(refundData)
          } else {
            //in error(auth failed or refrenece id incorrect or more its showing status ok(200)
            //so we have to apply other throw functionalty)
            if (result.data.reason) throw new Error(result.data.reason)
            throw new Error('Cashfree Refund API Err::')
          }
        }
        // console.log("refundData",refundData)
      } catch (e) {
        if (e.response && e.response.data && e.response.data.message)
          throw new Error(e.response.data.message)
        throw new Error(e)
      }
      //AZURE QUEUE service bus
      await orderRefundServiceBusHook(orderItem.orderNo)
      //
      //
      let res = null
      const postData1 = {
        order_number: orderItem.orderNo,
      }
      const payload1 = qs.stringify(postData1)
      try {
        // res = await axios({
        //   method: 'post',
        //   url: 'http://tablezware-dev.tablez.com/api/v1/order/return',
        //   headers: {
        //     'Content-Type': 'application/x-www-form-urlencoded',
        //     Authorization: `Bearer ${TOKEN}`,
        //   },
        //   data: payload1,
        // })
        // console.log('res', res)
      } catch (e) {
        console.log('return api Err::', e)
      }
      if (refund) {
        //for orderitem update
        await OrderItem.findByIdAndUpdate(orderItemId, {
          $inc: {
            amountRefunded: amount,
          },
          $addToSet: {
            refunds: refund._id,
          },
        })
        await OrderItem.updateMany(
          { orderId: orderItem.orderId },
          {
            $inc: {
              totalAmountRefunded: amount,
            },
          }
        )
        //updating payment and order
        await Order.findByIdAndUpdate(orderItem.orderId, {
          $inc: { totalAmountRefunded: amount },
        })
        await Order.findOneAndUpdate(
          { _id: orderItem.orderId, 'items.pid': orderItem.pid },
          {
            $inc: {
              'items.$.amountRefunded': amount,
            },
            $addToSet: {
              'items.$.refunds': refund._id,
            },
          },
          { new: true }
        )

        await Payment.findByIdAndUpdate(orderItem.payment, {
          $set: {
            totalAmountRefunded: amount,
          },
        })
      }
      return orderItem
    },
    paymentConfirmation: async (root, args, { req }): Promise<any> => {
      try {
        const payment = await Payment.findById(args.paymentId)
        if (!payment) throw new Error('payment id invalid')
        console.log('payment data is:', payment)
        if (payment.paymentGateway.toLowerCase() == 'cashfree') {
          console.log('Check pending payment for cashfree')
          const settings = await Setting.findOne()
          if (!settings) throw new Error('Settings not found')
          const stage = settings.paymentStage || 'PROD'
          let status_url = 'TEST'
          if (stage == 'PROD') {
            status_url = 'https://api.cashfree.com/api/v1/order/info/status'
          } else {
            status_url = 'https://test.cashfree.com/api/v1/order/info/status'
          }
          const postData = {
            appId: CASHFREE_APPID,
            secretKey: CASHFREE_SECRET_KEY,
            orderId: payment.orderId,
          }
          const payload = qs.stringify(postData)

          let result = null
          try {
            result = await axios({
              method: 'post',
              url: status_url,
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
              data: payload,
            })
            console.log('res', result)
            //if u face auth error , make sure hit the test url (not prod)
            if (result.data) {
              if (result.data.reason) throw new Error(result.data.reason)
              throw new Error('Cashfree Refund API Err::')
            }
          } catch (e) {
            // console.log('Cashfree payment status API Err::', e)
            if (e.response && e.response.data && e.response.data.message)
              throw new Error(e.response.data.message)
            throw new Error(e)
          }
        }
        return payment
      } catch (e) {
        throw new Error(e)
      }
    },
    paypalPayNow: async (root, args, { req }): Promise<any> => {
      const { userId } = req.session
      try {
        const me: any = await User.findById(userId)
        if (!me) throw new UserInputError('User not found')
        // const WWW_URL = req.headers.origin
        // console.log('WWW_URL.................', WWW_URL)
        // const { userId } = req.session
        let newOrder: any = null
        try {
          newOrder = await placeOrder(req, { address: args.address })
        } catch (e) {
          console.log('Place Order Err::: ', e)
          throw new UserInputError(e)
        }
        const settings = await Setting.findOne({})
        const customerName =
          newOrder.address.userFirstName ||
          newOrder.userFirstName ||
          settings.websiteName
        const customerPhone =
          newOrder.address.phone || newOrder.userPhone || '9999999999'
        const customerEmail =
          newOrder.address.email || newOrder.userEmail || 'hi@litekart.in'
        const postData = {
          intent: 'sale',
          payer: {
            payment_method: 'paypal',
          },
          redirect_urls: {
            return_url: `${WWW_URL}/success`,
            cancel_url: `${WWW_URL}/cancel`,
          },
          transactions: [
            {
              // optional
              //  item_list: {
              //    items: [
              //      {
              //        name: 'Red Sox Hat',
              //        sku: '001',
              //        price: '25.00',
              //        currency: 'USD',
              //        quantity: 1,
              //      },
              //    ],
              //  },
              amount: {
                currency: settings.currencyCode,
                total: newOrder.amount.total,
              },
              description: `Payment for shopping at ${settings.websiteName}`,
            },
          ],
        }
        let referenceId, approvalUrl
        paypal.payment.create(postData, function (error, payment) {
          if (error) {
            throw error
          } else {
            referenceId = payment.id
            console.log('payment res', payment)
            for (let i = 0; i < payment.links.length; i++) {
              if (payment.links[i].rel === 'approval_url') {
                approvalUrl = payment.links[i].href
                console.log('redirect url', approvalUrl)
              }
            }
          }
        })

        const paymentMode = 'online',
          paymentGateway = 'paypal',
          invoiceId = newOrder._id,
          receipt = newOrder.cartId.toString(),
          orderId = newOrder._id.toString(),
          amountPaid = 0,
          amountDue = newOrder.amount.total,
          currency = settings.currencyCode
        let store
        if (newOrder.store) store = newOrder.store
        const payment = await Payment.create({
          paymentMode,
          paymentGateway,
          invoiceId,
          receipt,
          orderId,
          amountPaid,
          amountDue,
          currency,
          email: customerEmail,
          contact: customerPhone,
          customerName,
          store,
          referenceId,
        })
        await Order.findByIdAndUpdate(
          newOrder._id,
          {
            $set: {
              paymentMode,
              paymentGateway,
              invoiceId,
              receipt,
              orderId,
              amountPaid,
              amountDue,
              currency,
              payment: payment._id,
              paymentReferenceId: referenceId,
            },
          },
          { new: true }
        )
        //for orderitem update
        await OrderItem.updateMany(
          { orderId: newOrder._id },
          {
            $set: {
              paymentMode,
              paymentGateway,
              invoiceId,
              receipt,
              orderId,
              amountPaid,
              amountDue,
              currency,
              payment: payment._id,
              paymentReferenceId: referenceId,
            },
          }
        )
        return payment
      } catch (e) {
        console.log('paypal payment initiate api Err::', e)
      }
    },
    paypalExecute: async (root, args, { req }): Promise<any> => {
      const { userId } = req.session
      try {
        //we will take these in query parameters in future
        const payerId = args.PayerID
        const paymentId = args.paymentId
        const payment = await Payment.findById(paymentId)
        if (!payment) throw new Error('incorrect payment id')

        const postData = {
          payer_id: payerId,
          transactions: [
            {
              amount: {
                currency: payment.currency,
                total: payment.amountDue,
              },
            },
          ],
        }

        paypal.payment.execute(paymentId, postData, function (error, payment) {
          if (error) {
            console.log(error.response)
            throw error
          } else {
            console.log(JSON.stringify(payment))
          }
        })
        return
      } catch (e) {
        console.log('paypal success  api Err::', e)
      }
    },
  },
}

export default resolvers
