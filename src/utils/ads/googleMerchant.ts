import axios from 'axios'
var request = require('request')
import {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_MERCHANT_ID,
  GOOGLE_REDIRECT_URI,
  GOOGLE_SHIPPONG_BASE_URL,
} from '../../config'

const generateToken = async (auth_code: string) => {
  console.log('calling generateToken')
  if (!auth_code) return
  try {
    const url = `https://accounts.google.com/o/oauth2/token?code=${auth_code}&client_id=${GOOGLE_CLIENT_ID}&client_secret=${GOOGLE_CLIENT_SECRET}&redirect_uri=${GOOGLE_REDIRECT_URI}&grant_type=authorization_code`
    const options = {
      method: 'POST',
      url,
    }
    request(options, function (error, response) {
      if (error) throw new Error(error)
      const body = JSON.parse(response.body)
      console.log('body...........', body)
      // if(body && body.)
      // if (body.error) console.log('Grant Err.........', body)
    })
    return 'xyz' //token return
  } catch (e) {
    console.log('error occured in generateToken')
    // throw new Error(e)
  }
}

export const googleMerchantListProduct = async (authCode: string) => {
  console.log('calling googleMerchantListProduct')
  const token = await generateToken(authCode)
  try {
    const config: any = {
      method: 'get',
      url: `${GOOGLE_SHIPPONG_BASE_URL}${GOOGLE_MERCHANT_ID}/products`,
      headers: {
        'Content-Type': 'application/json',
        authorization: `Bearer ${token}`,
      },
    }
    const response: any = await axios(config)
    console.log('response: ', response.data.kind, response.data.resources)
  } catch (e) {
    console.log('error occured in listing')
    console.log('Error', e.response.data)
  }
}

export const googleMerchantGetProduct = async ({
  authCode,
  merchantProductId,
}: any) => {
  try {
    console.log('calling googleMerchantGetProduct', merchantProductId)
    const token = await generateToken(authCode)

    const config: any = {
      method: 'get',
      url: `${GOOGLE_SHIPPONG_BASE_URL}${GOOGLE_MERCHANT_ID}/products/${merchantProductId}`,
      headers: {
        'Content-Type': 'application/json',
        authorization: `Bearer ${token}`,
      },
    }
    const response: any = await axios(config)
    console.log('response: ', response.data)
    return
  } catch (e) {
    console.log('eeeee', e.response.data)
  }
}

export const googleMerchantDeleteProduct = async ({
  authCode,
  merchantProductId,
}: any) => {
  try {
    // merchantProductId	is REST ID (received at time of creation)
    console.log('caling googleMerchantDeleteProduct', merchantProductId)
    const token = await generateToken(authCode)

    const config: any = {
      method: 'delete',
      url: `${GOOGLE_SHIPPONG_BASE_URL}${GOOGLE_MERCHANT_ID}/products/${merchantProductId}`,
      headers: {
        'Content-Type': 'application/json',
        authorization: `Bearer ${token}`,
      },
    }
    const response: any = await axios(config)
    console.log('response: ', response)
    if (response) return true
    return false
  } catch (e) {
    console.log('eeeee', e.response.data)
    throw new Error(e)
  }
}

export const googleMerchantInsertProduct = async ({
  authCode,
  product,
}: any) => {
  try {
    console.log('calling googleMerchantInsertProduct')
    if (!product || !authCode) return
    const token = await generateToken(authCode)
    let productData: any = {}
    productData.kind = 'content#product'
    productData.offerId = product._id //product ID assigned by merchant
    if (product.name) productData.title = product.name
    if (product.description) productData.description = product.description
    if (product.link) productData.link = product.link
    if (product.img) productData.imageLink = product.img
    if (product.contentLanguage)
      productData.contentLanguage = product.contentLanguage //'en'
    if (product.targetCountry) productData.targetCountry = product.targetCountry
    if (product.channel) productData.channel = product.channel //online or local
    if (product.ageGroup) productData.ageGroup = product.ageGroup //'adult'
    if (product.availability) productData.availability = product.availability
    if (product.availabilityDate)
      productData.availabilityDate = product.availabilityDate // need to add
    if (product.brand && product.brand.name)
      productData.brand = product.brand.name
    if (product.color && product.color.name)
      productData.color = product.color.name
    if (product.condition) productData.condition = product.condition
    if (product.gender) productData.gender = product.gender
    if (product.gtin) productData.gtin = product.gtin
    if (product.productMasterId)
      productData.itemGroupId = product.productMasterId
    if (product.mpn) productData.mpn = product.mpn //Manufacturer Part Number
    if (product.price) productData.price.value = product.price
    if (product.currency) productData.price.currency = product.currency
    if (product.size && product.size.name)
      productData.sizes = [product.size.name]
    if (product.googleProductCategory)
      productData.googleProductCategory = product.googleProductCategory

    const data = JSON.stringify(productData)
    const config: any = {
      method: 'post',
      url: `${GOOGLE_SHIPPONG_BASE_URL}${GOOGLE_MERCHANT_ID}/products`,
      headers: {
        'Content-Type': 'application/json',
        authorization: `Bearer ${token}`,
      },
      data: data,
    }
    const response: any = await axios(config)
    console.log('response', response.data)
    //REST-ID is assigned to a product by Google,REST ID uniquely identifies a product, and it is an aggregate in the format online:en:US:1111111111
    // REST ID consists of 4 parts, separated by colons: channel, language, country and offer ID.
    if (response && response.data) return response.data
  } catch (e) {
    console.log('eeeee', e.response.data)
  }
}

export const googleMerchantCustomBatchInsertProduct = async ({
  batchId,
  authCode,
  products,
}: any) => {
  try {
    console.log('calling googleMerchantCustomBatchInsertProduct')
    if (!products || !authCode) return
    const token = await generateToken(authCode)
    if (products.length < 1) return
    let entries = []
    for (let product of products) {
      let productData: any = {}
      productData.batchId = batchId // 1111
      productData.merchantId = GOOGLE_MERCHANT_ID
      productData.method = 'insert'
      //product info
      let prod: any = {}
      prod.kind = 'content#product'
      prod.offerId = product._id //product ID assigned by merchant
      if (product.name) prod.title = product.name
      if (product.description) prod.description = product.description
      if (product.link) prod.link = product.link
      if (product.img) prod.imageLink = product.img
      if (product.contentLanguage)
        prod.contentLanguage = product.contentLanguage //'en'
      if (product.targetCountry) prod.targetCountry = product.targetCountry
      if (product.channel) prod.channel = product.channel //online or local
      if (product.ageGroup) prod.ageGroup = product.ageGroup //'adult'
      if (product.availability) prod.availability = product.availability
      if (product.availabilityDate)
        prod.availabilityDate = product.availabilityDate // need to add
      if (product.brand && product.brand.name) prod.brand = product.brand.name
      if (product.color && product.color.name) prod.color = product.color.name
      if (product.condition) prod.condition = product.condition
      if (product.gender) prod.gender = product.gender
      if (product.gtin) prod.gtin = product.gtin
      if (product.productMasterId) prod.itemGroupId = product.productMasterId
      if (product.mpn) prod.mpn = product.mpn //Manufacturer Part Number
      if (product.size && product.size.name) prod.sizes = [product.size.name]
      //send price object
      let price: any = {}
      if (product.price) price.value = product.price
      if (product.currency) price.currency = product.currency
      else price.currency = 'INR'
      prod.price = price
      productData.product = prod
      entries.push(productData)
    }
    const data = JSON.stringify({ entries })
    console.log('entries', data)

    const config: any = {
      method: 'post',
      url: `${GOOGLE_SHIPPONG_BASE_URL}products/batch`,
      headers: {
        'Content-Type': 'application/json',
        authorization: `Bearer ${token}`,
      },
      data: data,
    }
    const response: any = await axios(config)
    console.log('response', response.data, response.data.entries[0].errors)
    //REST-ID is assigned to a product by Google,REST ID uniquely identifies a product, and it is an aggregate in the format online:en:US:1111111111
    // REST ID consists of 4 parts, separated by colons: channel, language, country and offer ID.
    if (response && response.data) return response.data
  } catch (e) {
    console.log('edata', e.response.data)
  }
}

//not in use beacause we will able to operate one by one
export const getGoogleMerchantCustombatchProduct = async ({
  batchId,
  authCode,
  products,
}: any) => {
  try {
    console.log('calling constGoogleMerchantCustombatchProduct')
    if (!products || !authCode) return
    const token = await generateToken(authCode)

    let entries = []
    for (let product of products) {
      let productData: any = {}
      productData.batchId = batchId // 1111
      productData.merchantId = GOOGLE_MERCHANT_ID
      productData.method = 'get'
      productData.productId = product.googleMerchantProductId
      entries.push(productData)
    }
    const data = JSON.stringify({ entries })
    console.log('entries', data)

    const config: any = {
      method: 'post',
      url: `${GOOGLE_SHIPPONG_BASE_URL}products/batch`,
      headers: {
        'Content-Type': 'application/json',
        authorization: `Bearer ${token}`,
      },
      data: data,
    }
    const response: any = await axios(config)
    console.log('response', response.data)
    //REST-ID is assigned to a product by Google,REST ID uniquely identifies a product, and it is an aggregate in the format online:en:US:1111111111
    // REST ID consists of 4 parts, separated by colons: channel, language, country and offer ID.
    if (response && response.data) return response.data
  } catch (e) {
    console.log('eeeee', e.response.data)
  }
}

//not in use beacause we will able to operate one by one
export const googleMerchantCustombatchDeleteProduct = async ({
  batchId,
  authCode,
  products,
}: any) => {
  try {
    // merchantProductId	is REST ID (received at time of creation)
    console.log('caling googleMerchantDeleteProduct')
    if (!products || !authCode) return
    const token = await generateToken(authCode)

    let entries = []
    for (let product of products) {
      let productData: any = {}
      productData.batchId = batchId // 1111
      productData.merchantId = GOOGLE_MERCHANT_ID
      productData.method = 'delete'
      productData.productId = product.googleMerchantProductId
      entries.push(productData)
    }
    const data = JSON.stringify({ entries })
    console.log('entries', data)

    const config: any = {
      method: 'post',
      url: `${GOOGLE_SHIPPONG_BASE_URL}products/batch`,
      headers: {
        'Content-Type': 'application/json',
        authorization: `Bearer ${token}`,
      },
      data: data,
    }
    const response: any = await axios(config)
    console.log('response', response.data)
    //REST-ID is assigned to a product by Google,REST ID uniquely identifies a product, and it is an aggregate in the format online:en:US:1111111111
    // REST ID consists of 4 parts, separated by colons: channel, language, country and offer ID.
    if (response && response.data) return response.data
  } catch (e) {
    console.log('eeeee', e.response.data)
    throw new Error(e)
  }
}
