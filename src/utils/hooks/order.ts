import { UserInputError } from 'apollo-server-errors'
import { insertServiceBusQueue, getServiceBusQueue } from '..'
import { ORDER_FLOW_QUEUE_NAME, ORDER_RETURN_QUEUE_NAME } from '../../config'

export const confirmOrderServiceBusHook = async (orderNo) => {
  try {
    const messages = [{ body: { orderNumber: orderNo, type: 'shipment' } }]
    const lazy = true
    console.log('calling confirmOrderServiceBusHook', messages)

    // await insertServiceBusQueue(ORDER_FLOW_QUEUE_NAME, messages, lazy)
    // const recievedMessages = await getServiceBusQueue(
    //   ORDER_FLOW_QUEUE_NAME,
    //   lazy
    // )
    // console.log('get messaging queue', recievedMessages)
  } catch (e) {}
}

export const returnOrReplaceServiceBusHook = async ({
  orderNo,
  barcode,
  qty,
}) => {
  try {
    const messages = [
      {
        body: {
          orderNumber: orderNo,
          barcode,
          quantity: qty,
          type: 'return',
        },
      },
    ]
    const lazy = true
    console.log('calling returnOrReplaceServiceBusHook', messages)

    // await insertServiceBusQueue(ORDER_RETURN_QUEUE_NAME, messages, lazy)
  } catch (e) {}
}
