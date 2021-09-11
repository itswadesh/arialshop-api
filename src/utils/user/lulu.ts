import axios from 'axios'
import {
  ORVILLE_URL,
  ORVILLE_DOMAIN,
  ORVILLE_CLIENT_ID,
  ORVILLE_CLIENT_SECRET,
  ORVILLE_ADMIN_USERNAME,
  ORVILLE_ADMIN_PASSWORD,
  LULU_CUSTOMER_QUEUE_NAME,
} from '../../config'
import {
  insertServiceBusQueue,
  getServiceBusQueue,
  receiveMessagesLoop,
} from '..'
import { FieldValueInstance } from 'twilio/lib/rest/preview/understand/assistant/fieldType/fieldValue'
import { UserInputError } from 'apollo-server-errors'
import { luluServiceBusHook } from '../'

export const generateLuluToken = async () => {
  try {
    // console.log('calling generateLuluToken function')
    const data = JSON.stringify({
      username: ORVILLE_ADMIN_USERNAME,
      password: ORVILLE_ADMIN_PASSWORD,
    })

    const config: any = {
      method: 'post',
      url: `${ORVILLE_URL}/hbapi/v1_0/auth/token`,
      headers: {
        domain: ORVILLE_DOMAIN,
        clientid: ORVILLE_CLIENT_ID,
        clientsecret: ORVILLE_CLIENT_SECRET,
        'Content-Type': 'application/json',
        Cookie:
          'TS01e9318f=01333245626da950fcf1fa26db5f9fc6ce8bb0875330319f1edff59ce050122558272405c7d52ca8b5d28c2e97b1e678b32f3e069a',
      },
      data: data,
    }

    const response: any = await axios(config)
    // console.log('response data is:', response.data)
    const token = response.data.token.access_token
    return token
  } catch (e) {
    throw new UserInputError(e)
  }
}

export const addCustomerInLulu = async (data: any) => {
  try {
    const token = await generateLuluToken()
    // console.log('addCustomerInLulu with data:', data)
    const config: any = {
      method: 'post',
      url: `${ORVILLE_URL}/hbapi/v1_1/customer/add`,
      headers: {
        entity: 'customer',
        action: 'register',
        'request-type': 'sync',
        company: '356176',
        channel: '3561763569990001',
        branch: '356999',
        user: ORVILLE_ADMIN_USERNAME,
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Cookie:
          'TS01e9318f=013332456241ec4b4f63dd1006d411de3ec8f7014590e8f73ae9676f4aab8ff1e57daaf250cd47677080b33cf7b53984e1046d0c20',
      },
      data,
    }
    //Service Bus
    await luluServiceBusHook(data)
    //
    const response: any = await axios(config)
    // console.log('response data is:', response.data)
    return response.data.data
  } catch (e) {
    console.log('LuLu error... ', e.toString())
  }
}
