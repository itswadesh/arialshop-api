export const { SHOP_NAME = 'Litekart' } = process.env

export const PAY_MESSAGE = 'Payment for shopping @ ' + SHOP_NAME

export const ORDER_PREFIX = 'T'

export const ORDER_ITEM_PREFIX = 'OI'

export const IMPORT_ERROR_PREFIX = 'ID'

export const STATIC_PATH = './../litekart-assets'

export const SEED_DATABASE = false // It consumes huge memory and throws out of memory exception. Seeds database with some demo data when the database is empty.

export const UPLOAD_DIR = '/images/'

export const RECENT_VIEWED_PRODUCTS_LIMIT = 10

// Store delivery time configuration
export const startT = { h: 8, m: 0 }
export const start = '10:00 pm'
export const endT = { h: 6, m: 0 }
export const end = '06:00 am'

export const closed = {
  from: { hour: 13, minute: 44 },
  to: { hour: 13, minute: 59 },
  message: 'Sorry we are closed from 1:44 PM to 1:59 PM',
}
// prettier-ignore
export const userRoles = ['user', 'delivery', 'support', 'vendor', 'manager', 'admin','super'] // This should be in ascending order of authority. e.g. In this case guest will not have access to any other role, where as admin will have the role of guest+user+vendor+manager+admin

export const language = 'en'
// prettier-ignore
export const worldCurrencies = ['AED', 'AFN', 'ALL', 'AMD', 'ANG', 'AOA', 'ARS', 'AUD', 'AWG', 'AZN', 'BAM', 'BBD', 'BDT', 'BGN', 'BHD', 'BIF', 'BMD', 'BND', 'BOB', 'BOV', 'BRL', 'BSD', 'BTN', 'BWP', 'BYN', 'BZD', 'CAD', 'CDF', 'CHE', 'CHF', 'CHW', 'CLF', 'CLP', 'CNY', 'COP', 'COU', 'CRC', 'CUC', 'CVE', 'CZK', 'DJF', 'DKK', 'DOP', 'DZD', 'EGP', 'ERN', 'ETB', 'EUR', 'FJD', 'FKP', 'GBP', 'GEL', 'GHS', 'GIP', 'GMD', 'GNF', 'GTQ', 'GYD', 'HKD', 'HNL', 'HRK', 'HTG', 'HUF', 'IDR', 'ILS', 'INR', 'IQD', 'IRR', 'ISK', 'JMD', 'JOD', 'JPY', 'KES', 'KGS', 'KHR', 'KMF', 'KPW', 'KRW', 'KWD', 'KYD', 'KZT', 'LAK', 'LBP', 'LKR', 'LRD', 'LSL', 'LYD', 'MAD', 'MDL', 'MGA', 'MKD', 'MMK', 'MNT', 'MOP', 'MRU', 'MUR', 'MVR', 'MWK', 'MXN', 'MXV', 'MYR', 'MZN', 'NAD', 'NGN', 'NIO', 'NOK', 'NZD', 'OMR', 'PAB', 'PEN', 'PGK', 'PHP', 'PKR', 'PLN', 'PYG', 'QAR', 'RON', 'RSD', 'RUB', 'RWF', 'SAR', 'SBD', 'SCR', 'SDG', 'SEK', 'SGD', 'SHP', 'SLL', 'SOS', 'SRD', 'SSP', 'STN', 'SVC', 'SYP', 'SZL', 'THB', 'TJS', 'TMT', 'TND', 'TOP', 'TRY', 'TTD', 'TWD', 'TZS', 'UAH', 'UGX', 'USD', 'USN', 'UYI', 'UYU', 'UZS', 'VEF', 'VND', 'VUV', 'WST', 'XAF', 'XCD', 'XDR', 'XOF', 'XPF', 'XSU', 'XUA', 'YER', 'ZAR', 'ZMW', 'ZWL']

export const sorts = [
  { name: 'Relevance', val: null },
  { name: 'Whats New', val: '-createdAt' },
  { name: 'Price low to high', val: 'price' },
  { name: 'Price high to low', val: '-price' },
]

export const returnReasons = [
  'Product Not Required Anymore',
  'Cash issue',
  'Ordered by mistake',
  'Want to change the product',
  'Delay delivery cancellation',
  'I have changed my mind',
  'Want to change order delivery details',
  'Others',
]
export const paymentStatuses = [
  'Initiated',
  'Pending',
  'Completed',
  'Failed',
  'Refunded',
  'Cancelled',
  'Paid',
]
export const orderStatuses = [
  {
    status: 'Ordered',
    title: 'Order Placed Successfully',
    body: 'Waiting for the vendor to confirm the order',
    icon: 'https://tablezprod.blob.core.windows.net/icons/fast-cart.png',
    public: true,
    index: 1,
    time: '',
  },
  {
    status: 'Confirmed',
    title: 'Order being processed',
    body: 'We are processing your order',
    icon: '/images/order/package.png',
    public: false,
    index: 2,
    time: '',
  },
  {
    status: 'Packed',
    title: 'Package is Ready!!',
    body: 'Your order is ready for pickup',
    icon: 'https://tablezprod.blob.core.windows.net/icons/product.png',
    public: true,
    index: 3,
    time: '',
  },
  {
    status: 'Shipped',
    title: 'Vroom Vroom!!',
    body: 'Order has been picked up and on the way',
    icon: 'https://tablezprod.blob.core.windows.net/icons/truck.png',
    public: true,
    index: 4,
    time: '',
  },
  {
    status: 'Out for delivery',
    title: 'Vroom Vroom!!',
    body: 'Order has been picked up and on the way',
    icon: '/images/order/delivery-boy.png',
    public: false,
    index: 5,
    time: '',
  },
  {
    status: 'Delivered',
    title: 'Order Delivered',
    body: 'The order has been delivered to you',
    icon: 'https://tablezprod.blob.core.windows.net/icons/open-parcel.png',
    public: true,
    index: 6,
    time: '',
  },
  {
    status: 'Return',
    title: 'Return Request Received',
    body: 'We received your return request and assigning courier partner for collecting the order',
    icon: '/images/order/shopping-bag.png',
    public: true,
    index: 7,
    time: '',
  },
  {
    status: 'Pickup',
    title: 'Pickup Scheduled',
    body: 'You returned this order and we are processing the refund',
    icon: '/images/order/shopping-bag.png',
    public: true,
    index: 8,
    time: '',
  },
  {
    status: 'Return Complete',
    title: 'Return Process Completed',
    body: 'We received the order soon we will start process of refund',
    icon: '/images/order/shopping-bag.png',
    public: true,
    index: 9,
    time: '',
  },
  {
    status: 'Refund',
    title: 'Refund Done',
    body: 'Your order has been refunded successfully',
    icon: '/images/order/shopping-bag.png',
    public: true,
    index: 10,
    time: '',
  },
  // {
  //   status: 'NIS',
  //   title: 'Not in stock',
  //   body: 'Item is out of stock and could not delivered',
  //   icon: '/images/order/shopping-bag.png',
  //   public: true,
  //   index: 10,
  // },
  {
    status: 'Cancelled',
    title: 'Order Cancelled',
    body: 'Your order has been cancelled, we have initiated the refund',
    icon: '/images/order/shopping-bag.png',
    public: true,
    index: 11,
    time: '',
  },
]

export const paymentMethods = [
  // {
  //   active: false,
  //   name: 'Online',
  //   value: 'Razorpay',
  //   img: 'https://devtbz-mum.s3.ap-south-1.amazonaws.com/paymentMethod/F88QJyEep-wallet-6i40AnLVKgPC.png',
  //   color: 'green',
  //   position: 2,
  //   text: 'Pay full amount with online / UPI / Wallets / Credit Cards / Debit Cards',
  // },

  {
    active: true,
    name: 'Manual',
    value: 'COD',
    img: 'https://devtbz-mum.s3.ap-south-1.amazonaws.com/paymentMethod/vqCYqg0L2-cod-B9ZAEZQhhSj8.png',
    color: 'red',
    position: 3,
    text: 'Pay Cash after your item arrives',
  },

  {
    active: true,
    name: 'Online',
    value: 'Cashfree',
    img: 'https://devtbz-mum.s3.ap-south-1.amazonaws.com/paymentMethod/F88QJyEep-wallet-6i40AnLVKgPC.png',
    color: 'green',
    position: 4,
    text: 'Pay full amount with online / UPI / Wallets / Credit Cards / Debit Cards',
  },

  // {
  //   active: true,
  //   name: 'Manual',
  //   value: 'Manual',
  //   img: 'https://devtbz-mum.s3.ap-south-1.amazonaws.com/paymentMethod/vqCYqg0L2-cod-B9ZAEZQhhSj8.png',
  //   color: 'white',
  //   position: 10,
  //   text: 'Pay using direct bank transfer, mobile number, qr code',
  // },

  // {
  //   active: false,
  //   name: 'Stripe',
  //   value: 'Stripe',
  //   color: 'blue',
  //   position: 5,
  //   text: 'Pay full amount with Stripe',
  //   img: '/images/paymentMethod/iI7afSkbi-stripe0.png',
  // },
]
// prettier-ignore
export const timesList = ['1 AM', '2 AM', '3 AM', '4 AM', '5 AM', '6 AM', '7 AM', '8 AM', '9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM', '4 PM', '5 PM', '6 PM', '7 PM', '8 PM', '9 PM', '10 PM', '11 PM', '12 AM']
