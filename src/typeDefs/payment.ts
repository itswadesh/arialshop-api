import { gql } from 'apollo-server-express'

export default gql`
  extend type Query {
    payments(
      page: Int
      skip: Int
      limit: Int
      search: String
      sort: String
      store: ID
    ): PayRes @support
    payment(id: ID!): Payment @auth
    razorpays: Payment
  }
  extend type Mutation {
    razorpay(address: ID): OnePayment @auth
    capturePay(paymentId: String!, oid: String!): Order @auth
    #stripe
    stripe(token: String!, address: ID): Order @auth
    stripePayNow(address: ID): Order @auth #create-payment-intent
    # paytm
    paytmPayNow(address: ID): OnePayment @auth
    paytmCapturePay(paymentId: String!, oid: String!): Order @auth
    # cashfree
    cashfreePayNow(address: ID): CashfreeRes @auth
    cashfreeCapturePay(paymentId: String!, oid: String!): Order @auth
    OrderRefund(
      orderItemId: ID!
      qty: Int!
      amount: Float!
      note: String!
      email: String!
      password: String!
    ): OrderItem
    paymentConfirmation(paymentId: ID!): OnePayment
    # paypal
    paypalPayNow(address: ID): OnePayment @auth
    paypalExecute(paymentId: ID!, payerId: String!): Order @auth
  }

  type CashfreeRes {
    appId: String
    orderId: String
    orderAmount: Float
    orderCurrency: String
    orderNote: String
    customerName: String
    customerEmail: String
    customerPhone: String
    returnUrl: String
    notifyUrl: String
    signature: String
    token: String
    url: String
    stage: String
  }
  type Payment {
    id: ID
    _id: ID
    orderId: String
    paymentOrderId: String
    paymentMode: String
    paymentGateway: String
    referenceId: String
    status: String
    txMsg: String
    txTime: String
    invoiceId: String
    receipt: String
    currency: String
    paid: Boolean
    amountPaid: Float
    amountRefunded: Float
    amountDue: Float
    captured: Boolean
    email: String
    contact: String
    notes: String
    fee: Float
    tax: Float
    errorCode: String
    errorDescription: String
    refundStatus: String
    description: String
    store: Store
  }

  type OnePayment {
    id: ID
    _id: ID
    orderId: String
    paymentOrderId: String
    paymentMode: String
    paymentGateway: String
    referenceId: String
    status: String
    txMsg: String
    txTime: String
    invoiceId: String
    receipt: String
    currency: String
    paid: Boolean
    amountPaid: Float
    amountRefunded: Float
    amountDue: Float
    captured: Boolean
    email: String
    contact: String
    notes: String
    fee: Float
    tax: Float
    errorCode: String
    errorDescription: String
    refundStatus: String
    description: String
    store: ID
  }

  type PayRes {
    data: [Payment]
    count: Int
    pageSize: Int
    page: Int
  }
`
