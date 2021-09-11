import axios from 'axios'
import { ObjectId } from 'mongodb'
import { mustBuilder, mustAggBuilder, dedupeIDs, unique } from '../'
import { getCache, setCache } from '../cache'
import { Product, Category, Color, Setting } from '../../models'
import { AddressDocument, OrderDocument } from '../../types'
import { generateAWBForShipment } from './shipRocketCourier'
import {
  SHIPROCKET_BASE_URL,
  SHIPROCKET_EMAIL,
  SHIPROCKET_PASSWORD,
} from '../../config'

export const shipRokectToken = async () => {
  const data = JSON.stringify({
    email: SHIPROCKET_EMAIL,
    password: SHIPROCKET_PASSWORD,
  })

  const config: any = {
    method: 'post',
    url: `${SHIPROCKET_BASE_URL}/auth/login`,
    headers: {
      'Content-Type': 'application/json',
    },
    data: data,
  }

  const response: any = await axios(config)
  console.log('response data is:', response.data)
  return response.data.token
}

//send order to shipRocket
export const createOrderOnShipRocket = async (
  order: OrderDocument,
  pid: string
) => {
  let token = await shipRokectToken()
  try {
    let order_items = []
    for (let item of order.items) {
      let orderItem: any = {}
      if (item.name) orderItem.name = item.name
      if (item.sku) orderItem.sku = item.sku
      if (item.qty) orderItem.units = item.qty
      if (item.mrp) orderItem.selling_price = item.mrp
      if (item.hsn) orderItem.hsn = item.hsn
      if (item.amount) {
        if (item.amount.discount) orderItem.discount = item.amount.discount
        if (item.amount.tax) orderItem.tax = item.amount.tax
      }
      order_items.push(orderItem)
    }

    const data = JSON.stringify({
      order_id: order.orderNo,
      order_date: order.createdAt,
      pickup_location: 'Jammu',
      channel_id: '12345',
      comment: 'Reseller: M/s Goku',
      billing_customer_name: order.address.firstName,
      billing_last_name: order.address.lastName,
      billing_address: order.address,
      billing_address_2: order.address,
      billing_city: order.address.city,
      billing_pincode: order.address.zip,
      billing_state: order.address.state,
      billing_country: order.address.country,
      billing_email: order.userEmail,
      billing_phone: order.userPhone,
      shipping_is_billing: true, //important
      shipping_customer_name: order.address.firstName,
      shipping_last_name: order.address.lastName,
      shipping_address: order.address,
      shipping_address_2: order.address,
      shipping_city: order.address.city,
      shipping_pincode: order.address.zip,
      shipping_country: order.address.country,
      shipping_state: order.address.state,
      shipping_email: order.userEmail,
      shipping_phone: order.userPhone,
      order_items,
      payment_method: order.paymentMode,
      shipping_charges: order.amount.shipping,
      giftwrap_charges: 0,
      transaction_charges: 0,
      total_discount: order.amount.discount,
      sub_total: order.amount.subtotal,
      length: 10,
      breadth: 15,
      height: 20,
      weight: 2.5,
    })

    const config: any = {
      method: 'post',
      url: `${SHIPROCKET_BASE_URL}/orders/create/adhoc`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      data: data,
    }

    const response: any = await axios(config)
    console.log('response after create order:', response)
    //let get awb number
    // await generateAWBForShipment({ token: token, shipment_id: order.itemOrderNo })
  } catch (e) {
    console.log('the error is: ', e)
  }
}
