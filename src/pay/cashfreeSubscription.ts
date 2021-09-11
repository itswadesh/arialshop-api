import { signForVerification } from './helpers-cashfree/cashfreeSignatureUtil'
import { transactionStatusEnum } from './helpers-cashfree/enums'
import {
  Order,
  OrderItem,
  Product,
  Payment,
  User,
  Subscribe,
  Subscription,
} from '../models'
import {
  IResolvers,
  UserInputError,
  ForbiddenError,
} from 'apollo-server-express'
import { WWW_URL } from '../config'
import { confirmSubscribe } from '../utils'

export default async function (req: any, res: any) {
  try {
    // console.log('cashfree success............', req.body)
    const subscribe = await Subscribe.findById(req.body.subscribeId)
    if (!subscribe)
      throw new UserInputError('Subscribe not found. Please try again')
    const signature = req.body.signature
    delete req.body.signature
    delete req.body.url
    const derivedSignature = await signForVerification(req.body)
    if (derivedSignature !== signature) {
      console.log('Signature mismatched', req.body)
      return res.redirect(
        `${WWW_URL}/payment/failed?id=${req.body.subscribeId}&status=SIGNATURE_MISMATCHED&provider=Cashfree`
      )
    }
    if (!req.body) {
      console.log('no response from cashfree', req.body)
      return res.redirect(
        `${WWW_URL}/payment/failed?id=${req.body.subscribeId}&status=NO_RESPONSE&provider=Cashfree`
      )
    }
    const txnTypes = transactionStatusEnum
    const paid = req.body.txStatus === 'SUCCESS'
    let amountPaid = 0,
      amountDue = req.body.orderAmount

    if (paid) {
      amountPaid = req.body.orderAmount
      amountDue = subscribe.amountDue - req.body.subscribeAmount
      if (amountDue < 0) amountDue = 0 // Temp solution because /api/pay/notify-cashfree not working for mobile
    }

    await Payment.findByIdAndUpdate(subscribe.payment, {
      $set: {
        referenceId: req.body.referenceId,
        status: req.body.txStatus,
        paymentMode: req.body.paymentMode,
        txMsg: req.body.txMsg,
        txTime: req.body.txTime,
        paid,
        captured: paid,
        amountPaid,
        amountDue,
      },
    })

    switch (req.body.txStatus) {
      case txnTypes.cancelled: {
        //buisness logic if payment was cancelled
        console.log('Payment Cancelled', req.body)
        return res.redirect(
          `${WWW_URL}/payment/cancelled?id=${req.body.subscribeId}&status=PAYMENT_CANCELLED&provider=Cashfree`
        )
      }
      case txnTypes.failed: {
        //buisness logic if payment failed
        console.log('Payment failed...', req.body)
        return res.redirect(
          `${WWW_URL}/payment/failed?id=${req.body.subscribeId}&status=PAYMENT_FAILED&provider=Cashfree`
        )
      }
      case txnTypes.success: {
        //buisness logic if payments succeed
        // const order = await Order.findById(req.body.orderId)
        if (!subscribe) {
          return res.redirect(
            `${WWW_URL}/payment/failed?id=${req.body.subscribeId}&status=ORDER_NOT_FOUND&provider=Cashfree`
          )
        }
        //payment is done but not updated the paid field in subscribe
        if (!subscribe.paid) await confirmSubscribe(req.body.subscribeId) // Cashfree will hit this endpoint twice. hence this check is required

        return res.redirect(
          `${WWW_URL}/payment/success?id=${req.body.subscribeId}&status=PAYMENT_SUCCESS&provider=Cashfree`
        )
      }
      default: {
        //When cancelled from UPI payment
        console.log('UPI Payment cancelled...', req.body)
        return res.redirect(
          `${WWW_URL}/payment/cancelled?id=${req.body.subscribeId}&status=PAYMENT_CANCELLED&provider=Cashfree`
        )
      }
    }
  } catch (err) {
    console.log('Payment Error', err)
    return res.redirect(
      `${WWW_URL}/payment/failed?id=${req.body.subscribeId}&status=PAYMENT_ERROR&provider=Cashfree`
    )
  }
}
