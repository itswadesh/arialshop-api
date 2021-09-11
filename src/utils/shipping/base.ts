import { UserInputError } from 'apollo-server-express'
import { Order, OrderItem, Setting } from '../../models'
import { createOrderOnShippo, createOrderOnShipRocket } from '.'

export const orderShippingAndUpdate = async (order: any, pid: string) => {
  try {
    console.log('calling orderShippingAndUpdate')
    const settings = await Setting.findOne({}).exec()
    if (!settings || !settings.shipping.enabled) return
    if (!order || !pid) throw new Error('something went wrong')
    let data
    //based on setting do shipping
    if (settings.shipping.provider.toLowerCase() == 'shippo') {
      data = await createOrderOnShippo(order, pid)
    } else if (settings.shipping.provider.toLowerCase() == 'shiprocket') {
      data = await createOrderOnShipRocket(order, pid)
    } else {
      console.log('wareIQ selected')
    }
    //based on data we will update shipment in order.items and orderItems
  } catch (e) {
    throw new UserInputError(e)
  }
}
