import { Setting } from '../../models'
import { UserInputError } from 'apollo-server-express'
import {
  generateOTP,
  sms,
  clearCart,
  insertServiceBusQueue,
  getServiceBusQueue,
  groupBy,
} from '../'
import { Order } from '../../models'
import {
  ORDER_FLOW_QUEUE_NAME,
  ORDER_SMS_QUEUE_NAME,
  ORDER_PREFIX,
  TOKEN,
} from '../../config'
import { sendMail } from '../email'
import { updateInventoryOnOrder } from '../inventory'

//this is responsible for send text confirmation that his/her order is placed successfully
export const orderSMS = async (order: any) => {
  try {
    // for (const item of order.items) {
    // const msg = `Thank you for ordering from tablez. Your order will be dispatched soon. Your delivery confirmation code is ${order.orderNo} Regards, Tablez Food Company`
    const msg = `Thank you for ordering from Tablez. Your order ${order.orderNo} will be dispatched soon. Your delivery confirmation code is 2143 Regards, Tablez Food Company`
    // console.log('OTP:: ', msg)
    // const messages = [{ body: { orderNumber: order.orderNo, message: msg } }]
    // const lazy = true
    // await insertServiceBusQueue(ORDER_SMS_QUEUE_NAME, messages, lazy)
    // const recievedMessages = await getServiceBusQueue(
    //   ORDER_SMS_QUEUE_NAME,
    //   lazy
    // )
    // console.log('get messaging queue for order', recievedMessages)
    sms({ phone: order.userPhone, msg, otp: null })
    // }
  } catch (e) {
    throw new UserInputError(e)
  }
}
