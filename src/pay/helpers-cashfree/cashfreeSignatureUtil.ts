import crypto from 'crypto'
import { CASHFREE_APPID, CASHFREE_SECRET_KEY } from '../../config'
import axios from 'axios'
import { Setting } from '../../models'
// function valueCleaner(keyword, data) {
//   return data[keyword] ? data[keyword] : ''
// }

export const sign = async (data: any) => {
  const settings = await Setting.findOne()
  if (!settings) throw new Error('Settings not found')
  const stage = settings.paymentStage || 'PROD'
  const sortedkeys = Object.keys(data)
  let url = '',
    mobileTokenUrl = '',
    signatureData = '',
    token = null
  sortedkeys.sort()
  for (const i of sortedkeys) {
    const k = i
    signatureData += k + data[k]
  }
  if (stage == 'PROD') {
    url = 'https://www.cashfree.com/checkout/post/submit'
    mobileTokenUrl = 'https://api.cashfree.com/api/v2/cftoken/order'
  } else {
    url = 'https://test.cashfree.com/billpay/checkout/post/submit'
    mobileTokenUrl = 'https://test.cashfree.com/api/v2/cftoken/order'
  }
  const signature = await crypto
    .createHmac('sha256', CASHFREE_SECRET_KEY)
    .update(signatureData)
    .digest('base64')
  try {
    // console.log('order details for cftoken generation.......', {
    //   url: mobileTokenUrl,
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'x-client-id': CASHFREE_APPID,
    //     'x-client-secret': CASHFREE_SECRET_KEY,
    //   },
    //   orderId: data.orderId,
    //   orderAmount: data.orderAmount,
    //   orderCurrency: data.orderCurrency,
    // })
    token = (
      await axios({
        method: 'post',
        url: mobileTokenUrl,
        headers: {
          'Content-Type': 'application/json',
          'x-client-id': CASHFREE_APPID,
          'x-client-secret': CASHFREE_SECRET_KEY,
        },
        data: {
          orderId: data.orderId,
          orderAmount: data.orderAmount,
          orderCurrency: data.orderCurrency,
        },
      })
    ).data.cftoken
  } catch (e) {
    // console.log('CAshfree mobile token...', token)
  }
  data.signature = signature
  data.token = token
  data.url = url
  data.stage = stage
  return data
}
export const signForVerification = async (data: any) => {
  const signatureData =
    data['orderId'] +
    data['orderAmount'] +
    data['referenceId'] +
    data['txStatus'] +
    data['paymentMode'] +
    data['txMsg'] +
    data['txTime']
  return await crypto
    .createHmac('sha256', CASHFREE_SECRET_KEY)
    .update(signatureData)
    .digest('base64')
}
