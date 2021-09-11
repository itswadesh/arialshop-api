import { UserInputError } from 'apollo-server-express'
import { Order, OrderItem, Product, Setting, Cart } from '../../models'

export const returnCompleteOrder = async (orderId, pid) => {
  try {
    const order = await Order.findById(orderId)
    if (!order) throw new UserInputError('Order not found')

    //updating product stock
    for (let item of order.items) {
      if (item.pid == pid) {
        let product = await Product.findById(item.pid)
        if (product) {
          if (product.type === 'physical') {
            product.stock = product.stock + item.qty
            await product.save()
          }
        }
      }
    }
  } catch (e) {
    console.log('Return completion Order error...........', e)
  }
}
