import axios from 'axios'
const { Store, OrderHeader, OrderItem } = require('../models/middleware')
import { WAREIQ_ENDPOINT, WAREIQ_API_KEY } from '../../config'

export const createInstance = async () => {
  const instance = axios.create()
  instance.defaults.baseURL = WAREIQ_ENDPOINT
  instance.defaults.headers.common['Authorization'] = 'Token ' + WAREIQ_API_KEY
  instance.defaults.headers.post['Content-Type'] =
    'application/x-www-form-urlencoded'
  return instance
}

export const WareiqComponent = async (orderItemId, type) => {
  // type: "Prepaid"
  try {
    const item = await OrderItem.findOne({ where: { id: orderItemId } })
    const order = await OrderHeader.findOne({
      where: { order_number: item.order_number },
    })
    if (!order || !item) {
      throw new Error('Order Information not found')
    }

    let shipmentJson = {
      order_id: item.order_item_number + (type == 'Pickup' ? '_R' : ''),
      full_name: order.first_name + ' ' + order.last_name,
      customer_email: order.email,
      customer_phone: order.phone,
      address1: order.address,
      city: order.city,
      pincode: order.zip_code,
      state: order.state,
      country: order.country,
      payment_method: type, //Prepaid, Cod, Pickup
      shipping_charges: order.shipping,
      total: order.total - order.shipping,
      warehouse: item.store_id,
      products: [
        {
          sku: item.product_id,
          name: item.name,
          price: item.price,
          quantity: item.qty,
          height: parseFloat(item.product_height),
          length: parseFloat(item.product_length),
          breadth: parseFloat(item.product_width),
          weight: parseFloat(item.product_weight),
        },
      ],
      billing_address: {
        first_name: order.first_name,
        last_name: order.first_name,
        address1: order.address,
        city: order.city,
        pincode: order.zip_code,
        state: order.state,
        country: order.country,
        phone: order.phone,
      },
    }
    console.log(shipmentJson)
    //return true;
    const instance = await createInstance()
    let response = await instance.post('/orders/add', shipmentJson)
    console.log(response.data)
    const wareIQUniqueID = response.data.unique_id
    await OrderItem.update(
      {
        shipping_ref_id: wareIQUniqueID,
      },
      {
        where: {
          order_item_number: item.order_item_number,
        },
      }
    )

    return true
  } catch (e) {
    console.log('WareIQ component' + e.message)
    return false
  }
}
