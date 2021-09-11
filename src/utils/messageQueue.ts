import { ServiceBusClient, ServiceBusMessage, delay } from '@azure/service-bus'
import { AZURE_QUEUE_CONNECTION_STRING } from '../config'

import {
  isServiceBusError,
  ProcessErrorArgs,
  ServiceBusReceivedMessage,
} from '@azure/service-bus'

export const insertServiceBusQueue = async (
  queueName: string,
  messages: any,
  lazy: boolean
) => {
  if (lazy == false) return
  // create a Service Bus client
  const sbClient = new ServiceBusClient(AZURE_QUEUE_CONNECTION_STRING)
  try {
    // createSender() can also be used to create a sender for a topic.
    const sender = sbClient.createSender(queueName)
    // create a batch object
    let batch = await sender.createMessageBatch()
    for (let i = 0; i < messages.length; i++) {
      if (!batch.tryAddMessage(messages[i])) {
        await sender.sendMessages(batch)

        batch = await sender.createMessageBatch()
        if (!batch.tryAddMessage(messages[i])) {
          throw new Error('Message too big to fit in a batch')
        }
      }
    }
    sender.sendMessages(batch)
    await sender.close()
  } catch (e) {
    console.log('Queue Err::' + e.toString())
  } finally {
    await sbClient.close()
  }
}

export const getServiceBusQueue = async (queueName: string, lazy: boolean) => {
  if (lazy == false) return
  const messages = []
  // create a Service Bus client
  const sbClient = new ServiceBusClient(AZURE_QUEUE_CONNECTION_STRING)
  try {
    const receiver = sbClient.createReceiver(queueName)
    // function to handle messages
    const myMessageHandler = async (messageReceived: any) => {
      console.log(
        `Received message:${messageReceived}, ${messageReceived.body}`
      )
      messages.push(messageReceived.body)
    }
    // function to handle any errors
    const myErrorHandler = async (error: any) => {
      console.log(error.toString())
    }

    // subscribe and specify the message and error handlers
    receiver.subscribe({
      processMessage: myMessageHandler,
      processError: myErrorHandler,
    })

    // Waiting long enough before closing the sender to send messages
    await delay(5000)

    await receiver.close()
    await sbClient.close()
    return messages
  } catch (e) {
    console.log('Ecomm Controller::' + e.toString())
  } finally {
    await sbClient.close()
  }
}
// [{body: {orderNumber:req.body.order_number,type:"shipment"}}]
// [{ body: { orderNumber: req.body.order_number, type: "return" } }]

// const messages = [{body: {orderNumber:req.body.order_number,type:"shipment"}}];
//         await (new UtilityComponent()).insertServiceBusQueue(messages);

//
//not using(in case we want it in loop)
export const receiveMessagesLoop = async (queueName: string, lazy: boolean) => {
  // create a Service Bus client
  const sbClient = new ServiceBusClient(AZURE_QUEUE_CONNECTION_STRING)

  const receiver = sbClient.createReceiver(queueName)
  try {
    for (let i = 0; i < 10; i++) {
      const messages = await receiver.receiveMessages(1, {
        maxWaitTimeInMs: 5000,
      })

      if (!messages.length) {
        console.log('No more messages to receive')
        break
      }

      console.log(`Received message #${i}: ${messages[0].body}`)
      await receiver.completeMessage(messages[0])
    }
    await receiver.close()
  } finally {
    await sbClient.close()
  }
}
