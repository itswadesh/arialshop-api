import { Router } from 'express'
import cashfree from './cashfree'
import cashfreeSubscription from './cashfreeSubscription'

export default function (app: Router) {
  app.post('/api/pay/capture-cashfree', cashfree)
  app.post('/api/pay/notify-cashfree', cashfree)
  app.post('/api/pay/capture-cashfree-subscription', cashfree)
  app.post('/api/pay/notify-cashfree-subscription', cashfree)
}
