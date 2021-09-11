import { Router } from 'express'
import products from './products'
import users from './users'
import categories from './categories'
import orders from './orders'
import brands from './brands'
import sizes from './sizes'
import features from './features'
import reviews from './reviews'
import options from './options'
import coupons from './couponsAdmin'
import colors from './colors'
import units from './units'
import carts from './carts'
import productSample from './product-sample'
import productPriceSample from './price-sample'
import categorySample from './category-sample'
import productsLength from './productsLength'
import pages from './pages'

import addresses from './addresses'
import allBanners from './allBanners'
import blogs from './blogs'
import faqs from './faqs'
import myChannels from './myChannels'
import myScheduleDemos from './myScheduleDemos'
import payments from './payments'
import popularSearches from './popularSearches'
import wishlists from './wishlists'

import { getDetailsFromAmazonPuppeteer } from './scrap'

export default function (app: Router) {
  app.get('/api/export/products', products)
  app.get('/api/export/users', users)
  app.get('/api/export/categories', categories)
  app.get('/api/export/orders', orders)
  app.get('/api/export/brands', brands)
  app.get('/api/export/sizes', sizes)
  app.get('/api/export/features', features)
  app.get('/api/export/reviews', reviews)
  app.get('/api/export/options', options)
  app.get('/api/export/couponsAdmin', coupons)
  app.get('/api/export/colors', colors)
  app.get('/api/export/units', units)
  app.get('/api/export/carts', carts)
  app.get('/api/export/productsLength', productsLength)
  app.get('/api/export/scrapData', getDetailsFromAmazonPuppeteer)
  app.get('/api/export/product-sample', productSample)
  app.get('/api/export/price-sample', productPriceSample)
  app.get('/api/export/category-sample', categorySample)
  app.get('/api/export/pages', pages)

  app.get('/api/export/addresses', addresses)
  app.get('/api/export/allBanners', allBanners)
  app.get('/api/export/blogs', blogs)
  app.get('/api/export/faqs', faqs)
  app.get('/api/export/myChannels', myChannels) //not working
  app.get('/api/export/myScheduleDemos', myScheduleDemos)
  app.get('/api/export/payments', payments)
  app.get('/api/export/popularSearches', popularSearches)
  app.get('/api/export/wishlists', wishlists)
}
