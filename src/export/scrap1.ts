const puppeteer = require('puppeteer')
;(async function main() {
  try {
    const browser = await puppeteer.launch({ headless: true })
    const page = await browser.newPage()
    // page.setUserAgent()
    await page.goto('https://www.toysrus.co.za/barbie/', {
      waitUntil: 'load',
      // Remove the timeout
      timeout: 0,
    })
    await page.waitForSelector('.item.product.product-item')
    const products = await page.$$('.item.product.product-item')
    console.log('show', products.length)

    for (const product of products) {
      //   console.log('product is', product)
      const button = await product.$('a.product.photo.product-item-photo')
      console.log('jj', button)
    }
  } catch (e) {
    console.log('the error is :', e)
  }
})()
