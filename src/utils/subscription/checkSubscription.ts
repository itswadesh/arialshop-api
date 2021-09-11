import { Product, Setting, Subscribe, Subscription } from '../../models'
import { Request } from '../../types'

export const checkSubscriptionProduct = async (req: Request) => {
  const { userId } = req.session
  const list: any = await Subscribe.find({ user: userId })
  for (const s of list) {
    const g2 = new Date()
    if (
      s.EndTimeISO.getTime() > g2.getTime() &&
      s.StartTimeISO.getTime() < g2.getTime()
    ) {
      // console.log('current subscription is', s)
      // means subscription currently going on
      if (s.subscription) {
        const subscription = await Subscription.findById(s.subscription)
        if (subscription && !subscription.unlimitedProducts) {
          return
        } else {
          const vendorProductsCount = await Product.find({
            vendor: userId,
          }).countDocuments()
          if (vendorProductsCount > subscription.productsAllowed - 1)
            throw new Error(
              `You are allowed to ${subscription.productsAllowed} products only`
            )
        }
      }
    }
  }
}
