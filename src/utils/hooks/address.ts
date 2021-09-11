import { UserInputError } from 'apollo-server-errors'
import { insertServiceBusQueue, getServiceBusQueue } from '..'
import {
  LOCATION_ZIP_QUEUE_NAME,
  CORD_ZIP_QUEUE_NAME,
  LOCATION_QUEUE_NAME,
} from '../../config'

export const getLocationFromZipServiceBusHook = async (zip) => {
  try {
    const messages = [{ body: { zip } }]
    const lazy = false
    console.log('calling getLocationFromZipServiceBusHook', messages)
    // await insertServiceBusQueue(LOCATION_ZIP_QUEUE_NAME, messages, lazy)
    // const recievedMessages = await getServiceBusQueue(
    //   LOCATION_ZIP_QUEUE_NAME,
    //   lazy
    // )
    // console.log('get queue for getLocationFromZip', recievedMessages)
  } catch (e) {}
}

export const getCoordinatesFromZipServiceBusHook = async (zip) => {
  try {
    const messages = [{ body: { zip } }]
    const lazy = false
    console.log('calling getCoordinatesFromZipServiceBusHook', messages)

    // await insertServiceBusQueue(CORD_ZIP_QUEUE_NAME, messages, lazy)
    // const recievedMessages = await getServiceBusQueue(
    //   CORD_ZIP_QUEUE_NAME,
    //   lazy
    // )
    // console.log('get queue for getCoordinatesFromZip', recievedMessages)
  } catch (e) {}
}

export const getLocationServiceBusHook = async ({ lat, lng }) => {
  try {
    const messages = [{ body: { lat, lng } }]
    const lazy = false
    console.log('calling getLocationServiceBusHook', messages)
    // await insertServiceBusQueue(LOCATION_QUEUE_NAME, messages, lazy)
    // const recievedMessages = await getServiceBusQueue(
    //   LOCATION_QUEUE_NAME,
    //   lazy
    // )
    // console.log('get queue Location from lat lng', recievedMessages)
  } catch (e) {}
}
