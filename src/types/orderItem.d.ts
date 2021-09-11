import { Document } from 'mongoose'
import {
  AddressDocument,
  BrandDocument,
  CartDocument,
  OrderStatusDocument,
  PaymentDocument,
  ProductDocument,
  RefundDocument,
  StoreDocument,
  UserDocument,
} from './'

export interface OrderItemDocument extends Document {
  active: boolean
  address: {
    email: string
    firstName: string
    lastName: string
    address: string
    town: string
    district: string
    city: string
    country: string
    company: string
    state: string
    coords: { lat: number; lng: number }
    lat: number
    lng: number
    zip: number
    phone: string
    deliveryInstructions: string
    active: boolean
    isResidential: boolean
    uid: UserDocument['_id']
  }
  addressId: AddressDocument['_id']
  amount: {
    qty: number
    subtotal: number
    tax: number
    discount: number
    totalDiscount: number
    shipping: number
    total: number
    currency: string
    exchangeRate: number
    offer: any
  }
  amountDue: number
  amountPaid: number
  awbNumber: string
  cancellationComment: string
  cancellationReason: string
  cartId: string
  codPaid: number
  comment: string
  coupon: object
  days: number
  invoiceId: string
  orderNo: string
  otp: string
  paid: boolean
  payment: PaymentDocument['_id']
  paymentAmount: number
  paymentCurrency: string
  paymentGateway: string //razorpay, cashfree, paytm , stripe
  paymentMode: string // COD  /online
  paymentMsg: string
  paymentNotes: object
  paymentOrderId: string
  paymentReceipt: string
  paymentReferenceId: string //Transaction Id
  paymentStatus: string
  paymentTime: date
  paySuccess: number //paySuccessPageHit
  returnComment: string
  store: StoreDocument['_id']
  totalAmountRefunded: number
  totalDiscount: number
  user: UserDocument['_id']
  userFirstName: string
  userLastName: string
  userPhone: string
  //************************* */
  //from here data is for seprate item
  amountRefunded: number
  barcode: string
  brand: BrandDocument['_id']
  brandImg: string
  brandName: string
  color: string
  courierName: string
  currency: string
  delivery: object
  description: string
  discount: number
  expectedDeliveryDate: date
  img: string
  invoiceLink: string
  itemOrderNo: string
  mrp: number
  name: string
  options: string
  orderId: OrderDocument['_id']
  orderHistory: [
    {
      body: string
      icon: string
      index: number
      public: boolean
      status: string
      time: date
      title: string
    }
  ]
  orderStatus: OrderStatusDocument['_id']
  parentBrand: BrandDocument['_id']
  parentBrandImg: string
  parentBrandName: string
  pid: ProductDocument['_id']
  posInvoiceNo: string
  price: number
  qty: number
  refunds: [RefundDocument['_id']]
  returnCourierName: string
  returnReason: string
  returnTrackingId: string
  returnValidTill: date
  reviewed: boolean
  shippingCharge: number
  size: string
  sku: string
  slug: string
  status: string
  subtotal: number
  tax: number
  time: string //txTime
  total: number
  tracking: string
  trackingId: string
  type: string
  vendor: UserDocument['_id']
  vendorInfo: {
    address: object
    email: string
    firstName: string
    lastName: string
    phone: string
    store: string
  }
}
