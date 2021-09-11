import demoProductsInput from '../../migrations/demoProducts'
import bannersInput from '../../migrations/banners'
import { Banner, Product } from '../../models'

export const createDemoProducts = async (store: any) => {
  try {
    console.log('calling createDemoProducts')
    demoProductsInput.map((data) => {
      data.store = store._id
      data.vendor = store.user
      data.demo = true
    })
    const products = await Product.create(demoProductsInput)
    products.forEach((data) => {
      data.save() //fire pre save hook
    })
    console.log('finished populating demo products in store')
  } catch (e) {
    console.log('Error populating demo products in store... ', e)
  }
}

export const createDemoBanners = async (store: any) => {
  try {
    console.log('calling createDemoBanners')
    bannersInput.map((data) => {
      data.store = store._id
      data.demo = true
    })
    const banners = await Banner.create(bannersInput)
    banners.forEach((data) => {
      data.save() //fire pre save hook
    })
    console.log('finished populating demo banners in store')
  } catch (e) {
    console.log('Error populating demo banners in store... ', e)
  }
}

export const deleteDemoProducts = async (store: any) => {
  try {
    console.log('calling deleteDemoProducts')
    const products = await Product.deleteMany({
      store: store._id,
      demo: true,
    })
    console.log('finished removing demo products from store')
    return products
  } catch (e) {
    console.log('Error removing demo products from store... ', e)
  }
}

export const deleteDemoBanners = async (store: any) => {
  try {
    console.log('calling deleteDemoBanners')
    const banners = await Banner.deleteMany({
      store: store._id,
      demo: true,
    })
    console.log('finished removing demo banners from store')
    return banners
  } catch (e) {
    console.log('Error removing demo banners from store... ', e)
  }
}
