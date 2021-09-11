import { UserInputError } from 'apollo-server-errors'
import { User } from '../../models'
import { addCustomerInLulu } from '../user/lulu'
import { insertServiceBusQueue, getServiceBusQueue } from '..'
import { SMS_QUEUE_NAME, LULU_CUSTOMER_QUEUE_NAME } from '../../config'

export const createUserHook = async (user) => {
  // console.log('calling createUserHook')
  // const result = await addCustomerInLulu({
  //   firstname: user.firstName,
  //   lastname: user.lastName,
  //   mobileno: user.phone,
  // })
  // console.log('result', result)
  // if (result) {
  //   await User.findByIdAndUpdate(user.id, {
  //     $set: { luluCustomerNo: result.customerno },
  //   })
  // }
}

export const luluServiceBusHook = async (data) => {
  const messages = [{ body: data }]
  const lazy = true
  console.log('calling luluServiveBusHook', messages)
  //   await insertServiceBusQueue(LULU_CUSTOMER_QUEUE_NAME, messages, lazy)
  //   const recievedMessages = await getServiceBusQueue(
  //     LULU_CUSTOMER_QUEUE_NAME,
  //     lazy
  //   )
  // console.log('get messaging queue', recievedMessages)
}

export const otpServiceBusHook = async (phone, otp) => {
  const messages = [{ body: { phone: phone, otp: otp } }]
  const lazy = true
  console.log('calling otpServiveBusHook', messages)
  try {
    // await insertServiceBusQueue(SMS_QUEUE_NAME, messages, lazy)
    //   const recievedMessages = await getServiceBusQueue(SMS_QUEUE_NAME, lazy)
    //   console.log('get messaging queue', recievedMessages)
  } catch (e) {
    throw new UserInputError(e)
  }
}
