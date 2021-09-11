import { gql } from 'apollo-server-express'

export default gql`
  extend type Query {
    salesByDay: [salesDayData]
    salesByMonth: [salesMonthData]
    salesByProduct: [salesProductData]
    salesByCustomer: [salesCustomerData]
    paymentsByType: [paymentTypeData]
  }
  type salesDayData {
    _id: String
    totalAmount: Float
    qty: Int
  }
  type salesMonthData {
    _id: String
    totalAmount: Float
    qty: Int
  }
  type salesProductData {
    _id: Product
    totalAmount: Float
    qty: Int
  }
  type salesCustomerData {
    _id: User
    totalAmount: Float
    qty: Int
  }
  type paymentTypeData {
    _id: String
    totalAmount: Float
    qty: Int
  }
`
