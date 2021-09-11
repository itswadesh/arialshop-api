import { Setting, User, Product } from '../../models'
import { UserInputError } from 'apollo-server-express'
import { orderSMS } from '../'

export const notifyCustomer = async ({ order }: any) => {
  // Handled at orderMessage/confirmOrder
  const setting = await Setting.findOne()
    .select('customerOrderNotifications adminNotifications')
    .exec()
  if (!setting) throw new UserInputError('Invalid store configuration')
  // console.log("setting", setting)
  if (setting.customerOrderNotifications) {
    // for (let item of order.items) {
    // console.log('product', item.pid)
    // let product = await Product.findById(item.pid)
    // if (setting.customerOrderNotifications.orderConfirmation) {
    //   await orderSMS(order) //send confirmattion to use
    // }
    // }
  }
}

export const orderStatusChange = async ({ order }: any) => {
  const setting = await Setting.findOne()
    .select('customerOrderNotifications adminNotifications')
    .exec()
  if (!setting) throw new UserInputError('Invalid store configuration')
  if (setting.customerOrderNotifications) {
    for (let item of order.items) {
      console.log('product', item.pid)
      let product = await Product.findById(item.pid)
      if (setting.customerOrderNotifications.orderStatusChanged) {
        if (setting.customerOrderNotifications.orderShipped) {
          console.log('orderShipped')
        }
        if (setting.customerOrderNotifications.orderIsReadyForPickup) {
          console.log('orderIsReadyForPickup')
        }
      }
    }
  }
}
