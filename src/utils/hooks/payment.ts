import { UserInputError } from 'apollo-server-errors'
import { insertServiceBusQueue, getServiceBusQueue } from '..'
import { ORDER_RETURN_QUEUE_NAME } from '../../config'

export const orderRefundServiceBusHook = async (orderNo) => {
  const messages = [{ body: { orderNumber: orderNo, type: 'return' } }]
  const lazy = false
  console.log('calling orderRefundServiceBusHook', messages)
  // await insertServiceBusQueue(ORDER_RETURN_QUEUE_NAME, messages, lazy)
  // const recievedMessages = await getServiceBusQueue(
  //   ORDER_RETURN_QUEUE_NAME,
  //   lazy
  // )
  // console.log('get messaging queue', recievedMessages)
}
