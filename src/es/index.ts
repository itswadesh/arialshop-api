import { Router } from 'express'
import products from './products'
import stores from './stores'
import autocomplete from './autocomplete'
import neteaseReceive from './neteaseReceive'
// import flutterVerifyOtp from './flutterVerifyOtp'
// import flutterAddToCart from './flutterAddToCart'

export default function (app: Router) {
  app.get('/api/products/es', products)
  app.get('/api/stores/es', stores)
  app.get('/api/products/autocomplete', autocomplete)
  app.post('/api/netease-receive', neteaseReceive)
  // app.get('/api/flutter/verify-otp', flutterVerifyOtp)
  // app.get('/api/flutter/add-to-cart', flutterAddToCart)
}
