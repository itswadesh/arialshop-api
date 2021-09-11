import axios from 'axios'
import { API_URL } from '../config'
export default async function (req: any, res: any) {
  try {
    const { qty, pid, vid, options, vendor, replace } = req.query
    const response = await axios.post(`${API_URL}/graphql`, {
      query: `mutation addToCart(
  $qty: Int!
  $pid: ID!
  $vid: ID
  $options: String
  $vendor: ID
  $replace: Boolean
) {
  addToCart(
    qty: $qty
    pid: $pid
    vid: $vid
    options: $options
    vendor: $vendor
    replace: $replace
  ) {
    items {
      pid
      vid
      barcode
      vendor {
        _id
        firstName
        lastName
        phone
      }
      brand {
        name
      }
      name
      slug
      qty
      price
      shippingCharge
      tax
      img
      options
    }
    qty
    subtotal
    discount {
      code
      value
      text
      amount
    }
    shipping {
      charge
    }
    total
    tax
  }
}`,
      variables: { qty: +qty, pid, vid, options, vendor, replace },
    })
    const data = response.data.data.addToCart
    data.cookie = response.headers['set-cookie'][0]
    res.status(200).send(data)
  } catch (e) {
    console.log('add err...............', e.toString())
    res.status(420).send(e)
  }
}
