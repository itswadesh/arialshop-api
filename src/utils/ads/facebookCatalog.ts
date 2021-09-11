import { UserInputError } from 'apollo-server-express'
import axios from 'axios'
var request = require('request')
import {
  FACEBOOK_APP_ID,
  FACEBOOK_APP_SECRET,
  FACEBOOK_CATALOG_ID,
  FACEBOOK_BASE_URL,
  FB_PAGE_ID,
} from '../../config'

const accessToken =
  'EAAMBd1yXQMQBAC9ymW3p3I3PycBJ2YJudFNjRvtZB9zZCqPAV8WyXqUFjBSarD5iFgazimW1hlYthKptpzmsw1W3DwnXmHSrB49DtucjYKUXBFFZAkddcCb6uB8Gw5Vd3L4qxH0HU34pZBbdrxK0ud6Ho0ZC0azNtKt62NQSCYASGwEkyHCHL9f0Wu1PouQCHWsf9xJAZCFFBDL65tf7jQVXyu3CVzIZAbmsp2hegbgF53TONW0hVRC'

export const longLivedUserAccessToken = async (short_lived_token) => {
  const url = `${FACEBOOK_BASE_URL}v2.10/oauth/access_token?grant_type=fb_exchange_token&client_id=${FACEBOOK_APP_ID}&client_secret=${FACEBOOK_APP_SECRET}&fb_exchange_token=${short_lived_token}`
  try {
    const response: any = await axios.get(url)
    console.log('res', response)
    //response format {"access_token":"ABC123","token_type":"bearer","expires_in":5183791}
    return 'userAccessToken'
  } catch (err) {
    // if(err && err.response && err.response.data)
    console.log('eee', err.response.data)
  }
}

export const generatePageAccessToken = async (userAccessToken) => {
  const url = `${FACEBOOK_BASE_URL}${FB_PAGE_ID}?fields=access_token&access_token=${userAccessToken}`
  try {
    const response: any = await axios.get(url)
    console.log('res', response)
    //response format {"access_token":"PAGE-ACCESS-TOKEN","id":"PAGE-ID" }
    return 'accessToken'
  } catch (err) {
    // if(err && err.response && err.response.data)
    console.log('eee', err.response.data)
  }
}

//TESTED FROM HERE via prakash 23-08-2021 (with live token)
export const fbProducts = async ({ short_lived_token }: any) => {
  try {
    const fields = `age_group, brand, gender, name, availability, category, description, image_url, price, currency, condition, url, retailer_product_group_id, retailer_id`
    const url = `${FACEBOOK_BASE_URL}${FACEBOOK_CATALOG_ID}/products?fields=${fields}&access_token=${accessToken}`
    const res = await axios.get(url)
    // console.log('body...........', res.data)
    if (res && res.data && res.data.data) return res.data.data
  } catch (e) {
    if (
      e.response &&
      e.response.data &&
      e.response.data.error &&
      e.response.data.error.message
    ) {
      console.log('error is', e.response.data.error.message)
    }
    throw new Error(e)
  }
}

export const fbProduct = async ({ short_lived_token, productId }: any) => {
  try {
    const fields = `age_group, brand, gender, name, availability, category, description, image_url, price, currency, condition, url, retailer_product_group_id, retailer_id`
    const url = `${FACEBOOK_BASE_URL}${productId}?fields=${fields}&access_token=${accessToken}`
    const res = await axios.get(url)
    // console.log('body...........', res.data)
    if (res && res.data) return res.data
  } catch (e) {
    if (
      e.response &&
      e.response.data &&
      e.response.data.error &&
      e.response.data.error.message
    ) {
      // console.log('error is', e.response.data.error.message)
      throw new Error(e.response.data.error.message)
    }
    throw new Error(e)
  }
}

export const fbSyncProduct = async ({
  products,
  short_lived_token,
  operation,
  setting,
}: any) => {
  console.log('calling fbSyncProduct')
  if (!operation) return
  // const userAccessToken = await longLivedUserAccessToken(short_lived_token)
  // const accessToken = await generatePageAccessToken(userAccessToken)

  // access_token: accessToken,
  let requests = []
  if (operation.toLowerCase() === 'delete') {
    for (let prod of products) {
      let request: any = {}
      request.method = 'DELETE'
      request.retailer_id = prod._id
      requests.push(request)
    }
  } else if (operation.toLowerCase() === 'create') {
    if (!setting) return
    for (let prod of products) {
      let data: any = {}
      if (prod.availability) data.availability = prod.availability
      if (prod.description) data.description = prod.description
      if (prod.img) data.image_url = prod.img
      if (prod.name) data.name = prod.name
      if (prod.price) data.price = prod.price
      if (prod.condition) data.condition = prod.condition
      if (prod.gender) data.gender = prod.gender
      if (prod.gtin) data.gtin = prod.gtin
      if (prod.link) data.url = prod.link
      if (prod.images) data.additional_image_urls = prod.images
      if (prod.age_group) data.age_group = prod.age_group // newborn, infant, toddler, kids, adult
      if (prod.productMasterId)
        data.retailer_product_group_id = prod.productMasterId
      //populated fields
      if (prod.brand && prod.brand.name) data.brand = prod.brand.name
      if (prod.color && prod.color.name) data.color = prod.color.name
      if (prod.size && prod.size.name) data.size = prod.size.name
      //from store setting
      if (setting.currencyCode) data.currency = setting.currencyCode
      // use google category(optional but will use in future)
      // data.category
      let request: any = {}
      request.method = 'CREATE'
      request.retailer_id = prod._id
      request.data = data
      requests.push(request)
    }
  } else if (operation.toLowerCase() === 'update') {
    for (let prod of products) {
      let data: any = {}
      if (prod.availability) data.availability = prod.availability
      if (prod.description) data.description = prod.description
      if (prod.img) data.image_url = prod.img
      if (prod.name) data.name = prod.name
      if (prod.price) data.price = prod.price
      if (prod.condition) data.condition = prod.condition
      if (prod.gender) data.gender = prod.gender
      if (prod.gtin) data.gtin = prod.gtin
      if (prod.link) data.url = prod.link
      if (prod.images) data.additional_image_urls = prod.images
      if (prod.age_group) data.age_group = prod.age_group // newborn, infant, toddler, kids, adult
      if (prod.productMasterId)
        data.retailer_product_group_id = prod.productMasterId
      //populated fields
      if (prod.brand && prod.brand.name) data.brand = prod.brand.name
      if (prod.color && prod.color.name) data.color = prod.color.name
      if (prod.size && prod.size.name) data.size = prod.size.name
      //from store setting
      if (setting && setting.currencyCode) data.currency = setting.currencyCode
      // use google category(optional but will use in future)
      // data.category
      let request: any = {}
      request.method = 'UPDATE'
      request.retailer_id = prod._id
      request.data = data
      requests.push(request)
    }
  }
  // console.log('requests', requests)
  try {
    const requestsData = JSON.stringify(requests)
    const url = `${FACEBOOK_BASE_URL}${FACEBOOK_CATALOG_ID}/batch?access_token=${accessToken}&requests=${requestsData}`
    let body = await axios.post(url)
    //tested for validation errors
    if (
      body &&
      body.data &&
      body.data.validation_status &&
      body.data.validation_status[0] &&
      body.data.validation_status[0].errors &&
      body.data.validation_status[0].errors[0] &&
      body.data.validation_status[0].errors[0].message
    ) {
      // console.log('error validation', body.data.validation_status[0].errors[0].message)
      throw new UserInputError(body.data.validation_status[0].errors[0].message)
    }
  } catch (e) {
    //tested for expited token
    if (e.response && e.response.data && e.response.data.error) {
      // console.log('e', e.response.data)
      throw new UserInputError(e.response.data.error.message)
    }
    throw new Error(e)
  }
}
