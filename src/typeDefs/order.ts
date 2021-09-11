import { gql } from 'apollo-server-express'

export default gql`
  extend type Query {
    hasOrder(product: ID!): Boolean
    validateCart: Boolean
    validateCoupon: Boolean

    # For admin : can query vendorwise too
    # Payments by status, Users count by role, orders count by status, products count by active, categories by megamenu
    # summary: TodaysSummary @admin
    allOrders(
      page: Int
      skip: Int
      limit: Int
      search: String
      sort: String
      vendor: String
      user: String
      today: Boolean
      status: String
      where: String
      store: ID
    ): orderRes @support

    orders(
      page: Int
      skip: Int
      limit: Int
      search: String
      sort: String
      vendor: String
      user: String
      today: Boolean
      status: String
      where: String
      store: ID
    ): orderItemRes @auth
    order(id: ID!): Order @auth
    vendorOrders(vendor: ID!, status: String): orderRes @auth

    # For delivery boy / vendor
    orderSummary: TodaysSummary @auth
    statusSummary: [StatusSummary] @auth
    paymentsSummary: TodaysSummary @auth
    vendorSummary: [TodaysSummary] @vendor # For vendor dashboard
    byVendor: DeliveryByVendor @auth
    dailySales: [salesData]
    delivery: delivery @auth
    paymentMethodSummary(vendor: ID): [MethodsSummary] @auth
    myOrders(
      page: Int
      skip: Int
      limit: Int
      search: String
      sort: String
      status: String
      where: String
      store: ID
    ): orderRes @auth

    myOrderItems(
      page: Int
      skip: Int
      limit: Int
      search: String
      sort: String
      status: String
      where: String
      store: ID
    ): orderItemRes @auth

    ordersByStatus(
      page: Int
      skip: Int
      limit: Int
      search: String
      sort: String
      status: String!
    ): myCustomerRes @auth
    ordersForPickup(
      page: Int
      skip: Int
      limit: Int
      search: String
      sort: String
      status: String!
      vendor: ID!
    ): myCustomerRes @auth
    myCustomers(
      page: Int
      skip: Int
      limit: Int
      search: String
      sort: String
    ): myCustomerRes @auth

    orderItem(id: ID!): OrderItem
  }

  extend type Mutation {
    create(id: ID!, body: String!): Order @auth
    createOrder(address: ID, user: ID!, items: [ItemIp!]): Order @admin #create order via admin
    checkout(paymentMethod: String, address: ID): Order @auth
    updateOrderItem(
      id: ID!
      status: String
      tracking: String
      trackingId: String
      returnTrackingId: String
      courierName: String
      returnCourierName: String
    ): OrderItem @auth

    updateOrder(
      id: ID!
      pid: ID!
      status: String
      tracking: String
      trackingId: String
      returnTrackingId: String
      courierName: String
      returnCourierName: String
    ): Order @auth

    collectPayment(id: ID!, codPaid: Float): Boolean @auth
    paySuccessPageHit(id: ID!): Int @auth
    returnOrReplace(
      orderId: ID!
      pId: String!
      qty: Int # if not provide then it will take all qty
      reason: String!
      requestType: String! # requestType: return or replacec
    ): Order @auth
    downloadInvoice(orderItemId: ID!): Order @auth
  }

  extend type Subscription {
    orderUpdated(id: ID!): Order
  }

  type StatusSummary {
    _id: String
    amount: Float
    count: Int
    createdAt: String
  }

  type DeliveryByVendor {
    data: [Delv]
    count: Int
    pageSize: Int
    page: Int
  }

  type Delv {
    _id: Delv2
    items: [CartItem]
    total: Int
    count: Int
    date: String
  }

  type Delv2 {
    vendor: User
  }

  type TC {
    _id: todaysVendors
    amount: Int
    count: Int
  }

  type todaysVendors {
    id: String
    firstName: String
    lastName: String
    address: Address
  }

  type salesData {
    _id: String
    total: Float
    qty: Int
  }

  type delivery {
    pending: DeliveryGroup
    out: DeliveryGroup
    cancelled: DeliveryGroup
    delivered: DeliveryGroup
    all: DeliveryGroup
  }

  type DeliveryGroup {
    _id: String
    total: Float
    count: Int
    items: [Order]
  }

  type TodaysSummary {
    _id: String
    count: Float
    amount: Float
    createdAt: String
    codPaid: Float
  }

  type MethodsSummary {
    _id: String
    amount: Float
    count: Int
  }

  type myCustomerRes {
    data: [myCustomer]
    count: Int
    pageSize: Int
    page: Int
  }

  type myCustomer {
    _id: Order
    items: [CartItem]
    total: Int
  }

  type orderRes {
    data: [Order]
    count: Int
    pageSize: Int
    page: Int
  }

  type Order {
    id: ID
    user: User
    userFirstName: String
    userLastName: String
    addressId: Address
    userPhone: String
    userEmail: String
    otp: String
    orderNo: String
    amount: Amount
    address: Address
    paymentOrderId: String
    cartId: Cart!
    items: [OrderItem!]
    orderItems: [OrderItem!]
    delivery: Delivery
    comment: String
    cancellationReason: String
    cancellationComment: String
    returnComment: String
    paySuccess: Int
    amountPaid: Float
    amountDue: Float
    totalAmountRefunded: Float
    payment: Payment
    paymentMode: String
    paymentMsg: String
    paymentTime: String
    paid: Boolean
    paymentGateway: String
    paymentAmount: Float
    paymentCurrency: String
    paymentReferenceId: String
    paymentStatus: String
    paymentReceipt: String
    invoiceId: String
    reviewed: Boolean
    createdAt: String
    updatedAt: String
    codPaid: Float
    store: Store
  }

  type orderItemRes {
    data: [OrderItem]
    count: Int
    pageSize: Int
    page: Int
  }

  type OrderItem {
    # for item
    id: ID
    amountRefunded: Float
    barcode: String
    brand: Brand
    brandImg: String
    brandName: String
    color: String
    courierName: String
    currency: String
    days: Int
    description: String
    discount: Float
    expectedDeliveryDate: String
    img: String
    invoiceLink: String
    itemOrderNo: String
    mrp: Float
    name: String
    options: String
    orderId: ID
    orderHistory: [OrderHistory]
    orderStatus: [OrderStatusRes] #not in use
    parentBrand: Brand
    parentBrandImg: String
    parentBrandName: String
    pid: ID
    posInvoiceNo: String
    price: Float
    qty: Int
    refunds: [Refund]
    returnCourierName: String
    returnReason: String
    returnTrackingId: String
    returnValidTill: String
    reviewed: Boolean
    shippingCharge: Float
    size: String
    sku: String
    slug: String
    status: String
    store: Store
    subtotal: Float
    tax: Float
    time: String
    total: Float
    tracking: String
    trackingId: String
    type: String
    vendor: User # Vendor
    vendorInfo: Vendor
    # for order(same fields for common orderID)
    active: Boolean
    address: Address
    addressId: Address
    amount: Amount
    amountDue: Float
    amountPaid: Float
    totalDiscount: Float
    totalAmountRefunded: Float
    cancellationComment: String
    cancellationReason: String
    cartId: Cart!
    codPaid: Float
    comment: String
    coupon: Coupon
    delivery: Delivery
    invoiceId: String
    orderNo: String
    otp: String
    paid: Boolean
    payment: Payment #in future we can populate
    paymentAmount: Float
    paymentCurrency: String
    paymentGateway: String
    paymentMode: String
    paymentMsg: String
    paymentNotes: String
    paymentOrderId: String
    paymentReceipt: String
    paymentReferenceId: String
    paymentStatus: String
    paymentTime: String
    paySuccess: Int
    returnComment: String
    user: User
    userEmail: String
    userFirstName: String
    userLastName: String
    userPhone: String
    # timestamp
    createdAt: String
    updatedAt: String
  }

  input ItemIp {
    id: String
    qty: Int
  }

  type Amount {
    qty: Int
    subtotal: Float
    tax: Float
    discount: Float
    shipping: Float
    total: Float
    currency: String
    exchangeRate: Float
    totalDiscount: Float
  }

  type Delivery {
    otp: String
    finish: Coords
  }

  type OrderHistory {
    id: String
    status: String
    title: String
    body: String
    icon: String
    public: Boolean
    index: Int
    time: String
    trackingId: String
    courierName: String
  }

  type Refund {
    amount: Float
    message: String
    qty: Int
    refundId: String
    time: String
  }
`
