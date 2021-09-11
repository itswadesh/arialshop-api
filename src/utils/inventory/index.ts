import { OrderItem, Product, Setting } from '../../models'
export const updateInventoryOnOrder = async (orderId) => {
  const orderItems = await OrderItem.find(orderId)
  for (const i of orderItems) {
    let product = await Product.findById(i.pid)
    product.stock = product.stock - i.qty
    await product.save()
  }
}
