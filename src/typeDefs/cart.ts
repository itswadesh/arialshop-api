import { gql } from 'apollo-server-express'

export default gql`
  extend type Query {
    carts(
      page: Int
      search: String
      limit: Int
      sort: String
      type: String
      active: Boolean
      store: ID
    ): cartRes @vendor
    abandoned(
      page: Int
      search: String
      limit: Int
      sort: String
      type: String
      active: Boolean
      store: ID
    ): cartRes @vendor
    cart: Cart
    # checkCart(pid: ID!): Boolean
    getCartQty(pid: ID!, vid: ID, options: String): Int!
    # getCartValue: Int!
  }

  extend type Mutation {
    addToCart(
      pid: ID!
      vid: ID
      options: String
      vendor: ID
      qty: Int!
      replace: Boolean
    ): Cart
    clearCart: Boolean
    deleteCart(id: ID!): Boolean
  }

  type Cart {
    id: ID
    uid: User
    cart_id: Cart
    qty: Int
    discount: Coupon
    subtotal: Float
    shipping: Shipping
    tax: Float
    total: Float
    offer_total: Float
    items: [CartItem]
    active: Boolean
    sid: String
    store: Store
    createdAt: String!
    updatedAt: String!
  }

  type CartItem {
    pid: ID
    vid: ID
    barcode: String
    vendor: User
    name: String
    img: String
    slug: String
    price: Float
    mrp: Float
    shippingCharge: Float
    status: String
    orderStatus: [OrderStatusRes]
    tracking: String
    qty: Int
    time: String
    options: String
    brand: Brand
    tax: Float
    brandName: String
    vendorFirstName: String
    vendorLastName: String
    vendorPhone: String
  }

  type cartRes {
    data: [Cart]
    count: Int
    pageSize: Int
    page: Int
  }

  type Vendor {
    store: String
    phone: String
    firstName: String
    lastName: String
    address: Address
    id: ID
  }
`
