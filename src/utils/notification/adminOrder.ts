import { Setting, User, Product } from '../../models'
import { UserInputError } from 'apollo-server-express'

export const notifyAdmin = async ({ order }: any) => {
    const setting = await Setting.findOne().select('customerOrderNotifications adminNotifications').exec()
     if (!setting) throw new UserInputError('Invalid store configuration')
    // console.log("setting", setting,order.items)
    if (setting.adminNotifications) {
            for (let item of order.items) {
                console.log("product", item.pid)
                let product = await Product.findById(item.pid)
                if (setting.adminNotifications.lowStockNotification) {
                    if (product.stock < 10) {
                        console.log("lets inform vendor about the product ,that its out of stock")
                        //notifcation email
                    }
                }
                if (setting.adminNotifications.newOrderPlaced) {
                    console.log("lets inform vendor that order has been placed")   
                }
            }
           
        
    }
}