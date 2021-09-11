import axios from 'axios'
import { AddressDocument, OrderDocument } from '../../types'
// var shippo = require('shippo')('<API_TOKEN>')
import { SHIPPO_API_TOKEN } from '../../config'

export const createOrderOnShippo = async (
  order: OrderDocument,
  pid: string
) => {
  console.log('calling createOrderOnShippo')
  try {
    let to_address: any = {}
    let from_address: any = {}
    if (order.address) {
      if (order.address.firstName) to_address.name = order.address.firstName
      if (order.address.lastName)
        to_address.name = to_address.name + order.address.lastName
      if (order.address.company) to_address.company = order.address.company
      if (order.address.country) to_address.country = order.address.country
      if (order.address.email) to_address.email = order.address.email
      if (order.address.phone) to_address.phone = order.address.phone
      if (order.address.state) to_address.state = order.address.state
      if (order.address.address) to_address.street1 = order.address.firstName
      if (order.address.zip) to_address.zip = order.address.zip
      if (order.address.lat) to_address.latitude = order.address.lat
      if (order.address.lng) to_address.longitude = order.address.lng
      to_address.is_residential = order.address.isResidential
      //
      if (order.address.town) to_address.name = order.address.town
      if (order.address.city) to_address.city = order.address.city
      if (order.address.district) to_address.district = order.address.district
    }
    //for vendorData
    for (let item of order.items) {
      if (item.pid == pid) {
        if (item.vendorInfo) {
          console.log('item.vendorInfo', item.vendorInfo)
          // if (item.vendorInfo.firstName)
          //   from_address.name = item.vendorInfo.firstName
          // if (item.vendorInfo.lastName)
          //   from_address.name = from_address.name + item.vendorInfo.lastName
          // if (item.vendorInfo.company)
          //   from_address.company = item.vendorInfo.company
          // if (item.vendorInfo.country)
          //   from_address.country = item.vendorInfo.country
          // if (item.vendorInfo.email) from_address.email = item.vendorInfo.email
          // if (item.vendorInfo.phone) from_address.phone = item.vendorInfo.phone
          // if (item.vendorInfo.state) from_address.state = item.vendorInfo.state
          // if (item.vendorInfo.address)
          //   from_address.street1 = item.vendorInfo.firstName
          // if (item.vendorInfo.zip) from_address.zip = item.vendorInfo.zip
          // if (item.vendorInfo.lat) from_address.latitude = item.vendorInfo.lat
          // if (item.vendorInfo.lng) from_address.longitude = item.vendorInfo.lng
          // //
        }
      }
    }
    //for items
    let line_items = []
    for (let item of order.items) {
      let lineItem: any = {}
      if (item.name) lineItem.title = item.name
      if (item.qty) lineItem.quantity = item.qty
      if (item.sku) lineItem.sku = item.sku
      if (item.total) lineItem.total_price = item.total
      if (item.description) lineItem.description = item.description
      if (item.weight) lineItem.weight = item.weight
      if (item.weight_unit) lineItem.weight_unit = item.weight_unit
      if (order.paymentCurrency) lineItem.currency = order.paymentCurrency
      if (item.manufacture_country)
        lineItem.manufacture_country = item.manufacture_country
      line_items.push(lineItem)
    }
    const data = JSON.stringify({
      to_address,
      from_address: to_address,
      line_items,
      placed_at: order.createdAt,
      order_number: order.orderNo,
      order_status: 'PAID',
      shipping_cost: order.amount.shipping,
      shipping_cost_currency: order.paymentCurrency,
      shipping_method: 'USPS First Class Package',
      subtotal_price: order.amount.subtotal,
      total_price: order.amount.total,
      total_tax: order.amount.tax,
      currency: order.paymentCurrency,
      weight: '0.40',
      weight_unit: 'lb',
    })

    const config: any = {
      method: 'post',
      url: `https://api.goshippo.com/orders/`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `ShippoToken ${SHIPPO_API_TOKEN}`,
      },
      data: data,
    }

    const response: any = await axios(config)
    console.log(
      'response after created order on shippo:',
      response.status,
      response.data
    )
    if (response.status == 201) {
      console.log('id', response.data.object_id)
      return true
    } else {
      return false
    }
  } catch (e) {
    console.log('the error in createOrderOnShippo is: ', e)
  }
}

export const retrieveAnOrderOnShippo = async (object_id: string) => {
  try {
    const config: any = {
      method: 'get',
      url: `https://api.goshippo.com/orders/${object_id}`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `ShippoToken ${SHIPPO_API_TOKEN}`,
      },
    }
    const response: any = await axios(config)
    console.log('response retrieve an order:', response.status, response.data)
    if (response.status == 200) {
      console.log('id', response.data)
      return true
    } else {
      return false
    }
  } catch (e) {
    console.log('the error in retrieveAnOrder is: ', e)
  }
}

export const listAllOrdersOnShippo = async () => {
  try {
    const config: any = {
      method: 'get',
      url: `https://api.goshippo.com/orders/`, //FOR FILETER---- ?end_date=2017-10-10T23:59:59-07:00&page=1&results=2
      headers: {
        'Content-Type': 'application/json',
        Authorization: `ShippoToken ${SHIPPO_API_TOKEN}`,
      },
    }
    const response: any = await axios(config)
    // console.log('response listAll Orders:', response.status, response.data)
    if (response.status == 200) {
      console.log('id', response.data.results)
      return true
    } else {
      return false
    }
  } catch (e) {
    console.log('the error in listAllOrders is: ', e)
  }
}

export const packingslipOnShippo = async (objectId: string) => {
  try {
    const config: any = {
      method: 'get',
      url: `https://api.goshippo.com/orders/${objectId}/packingslip/`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `ShippoToken ${SHIPPO_API_TOKEN}`,
      },
    }
    const response: any = await axios(config)
    console.log('response packingslip:', response.status, response.data)
  } catch (e) {
    console.log('the error in packingslip is: ', e)
  }
}

export const purchaseLabelForAnOrder = async () => {
  // console.log('calling purchaseLabelForAnOrder')
  try {
    const data = JSON.stringify({
      shipment: {
        address_from: {
          name: 'Mr. Hippo',
          street1: '215 Clayton St.',
          city: 'San Francisco',
          state: 'CA',
          zip: '94117',
          country: 'US',
          phone: '+1 555 341 9393',
          email: 'support@goshippo.com',
        },
        address_to: 'd799c2679e644279b59fe661ac8fa488',
        parcels: [
          {
            length: '5',
            width: '5',
            height: '5',
            distance_unit: 'in',
            weight: '2',
            mass_unit: 'lb',
          },
        ],
      },
      carrier_account: 'b741b99f95e841639b54272834bc478c',
      servicelevel_token: 'usps_first',
      order: '4f2bc588e4e5446cb3f9fdb7cd5e190b',
    })

    const config: any = {
      method: 'post',
      url: `https://api.goshippo.com/transactions/`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `ShippoToken ${SHIPPO_API_TOKEN}`,
      },
      data: data,
    }
    const response: any = await axios(config)
    console.log(
      'response purchaseLabelForAnOrder:',
      response.status,
      response.data
    )
  } catch (e) {
    console.log('the error in purchaseLabelForAnOrder is: ', e)
  }
}
