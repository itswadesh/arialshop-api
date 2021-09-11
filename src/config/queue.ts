export const {
  AZURE_QUEUE_CONNECTION_STRING = 'Endpoint=sb://tablez-dev-test.servicebus.windows.net/;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=',
} = process.env
export const ORDER_FLOW_QUEUE_NAME = 'tablez-order-flow'
export const ORDER_SMS_QUEUE_NAME = 'tablez-order-sms'
export const ORDER_RETURN_QUEUE_NAME = 'tablez-order-return'
export const SMS_QUEUE_NAME = 'tablez-login-otp' // Need consumer too
export const LULU_CUSTOMER_QUEUE_NAME = 'tablez-cdp-push' // Need consumer too

export const LOCATION_ZIP_QUEUE_NAME = 'tablez-location-zip'
export const CORD_ZIP_QUEUE_NAME = 'tablez-coordinates-zip'
export const LOCATION_QUEUE_NAME = 'tablez-location'
