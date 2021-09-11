const cheerio = require('cheerio')
import { UserInputError } from 'apollo-server-errors'
import { Router } from 'express'
const router = Router()
const puppeteer = require('puppeteer')
export const getDetailsFromAmazonPuppeteer = async (id: string) => {
  const url = `https://www.toysrus.co.za/barbie/`
  // console.log('the url is:', url)
  const browser: any = await puppeteer.launch({
    headless: false,
    args: [
      '--disable-gpu',
      '--disable-dev-shm-usage',
      '--disable-setuid-sandbox',
      '--no-first-run',
      '--no-sandbox',
      '--no-zygote',
    ],
  })
  // console.log('Browser after launch is:', browser)
  try {
    const page: any = await browser.newPage()
    await page.setViewport({ width: 1280, height: 800 })
    const r = await page.goto(url, { timeout: 60000 })
    await page.waitForSelector('.products.list.items.product-items')
    const content = await page.content()
    // console.log('all Front cpde of page is:', content)
    const $ = cheerio.load(content)
    const products = $('.item.product.product-item')
    console.log('totalproducts:', products.length)
    // for (const product of products) {
    //   const link = await product.querySelector(
    //     '.product.photo.product-item-photo'
    //   )
    //   console.log('aa', link)
    // }

    products.each(async (i: number, el: any) => {
      const link = await $(el).find('a').attr('href')
      const link_text = await $(el).find('a').text().trim()
      // let v = await $(el).find('td').text().trim()
      // await link.click()
      // console.log('the link is:', link_text, link)

      await Promise.all([
        page.waitForNavigation(),
        page.goto(link),
        page.waitForSelector('.page-title'),
      ])

      const info = await page.$eval('h1', (e) => e.innerText)

      const data = [
        {
          information: info,
        },
      ]
      console.log('data', data)

      // const page1: any = await browser.newPage()
      // const r1 = await page1.goto(link, { timeout: 60000 })
      // const content1 = await page1.content()
      // const $$ = cheerio.load(content1)
      // const pname = $$('h1 .page-title').text().trim()
      //   console.log('product name is:')
      // await page.goBack()
    })

    // const seller_price = $('#olp-upd-new .a-color-price')
    //   .text()
    //   .trim()
    //   .replace('₹ ', '')
    //   .replace(',', '')
    //   .replace('.00', '')
    //   .match(/\d+/g)
    // const deal =
    //   $('#priceblock_dealprice')
    //     .text()
    //     .trim()
    //     .replace('₹ ', '')
    //     .replace(',', '')
    //     .replace('.00', '')
    //     .match(/\d+/g) || seller_price
    // const sale =
    //   $('#priceblock_saleprice')
    //     .text()
    //     .trim()
    //     .replace('₹ ', '')
    //     .replace(',', '')
    //     .replace('.00', '')
    //     .match(/\d+/g) || deal
    // let price =
    //   $('#priceblock_ourprice')
    //     .text()
    //     .trim()
    //     .replace('₹ ', '')
    //     .replace(',', '')
    //     .replace('.00', '')
    //     .match(/\d+/g) || sale
    // let mrp =
    //   $('#price .a-text-strike')
    //     .text()
    //     .trim()
    //     .replace('₹ ', '')
    //     .replace(',', '')
    //     .replace('.00', '')
    //     .match(/\d+/g) || price
    // console.log('ID::: ', id, inStock, price, mrp)
    // price = price || [null]
    // mrp = mrp || [null]
    // if (price[0]) {
    //   console.log('Insert data...')
    //   // await PriceChart.updateOne(
    //   //   { id },
    //   //   { $set: { inStock, price: +price[0], mrp: +mrp[0] } }
    //   // )
    // }
    // $('#prodDetails tr ').each(async (i: number, el: any) => {
    //   let k = await $(el).find('th').text().trim()
    //   let v = await $(el).find('td').text().trim()
    //   if (k == 'Resolution') {
    //     const display_size = v && v.trim().includes('1080') ? 'FHD+' : 'HD+'
    //     // await PriceChart.updateOne(
    //   { id },
    //   { $set: { display_size, resolution: v.trim() } }
    // )
    // }
    // if (k == 'Item Weight') {
    //   // await PriceChart.updateOne(
    //   //   { id },
    //   //   { $set: { weight: v.replace(' g', '') } }
    //   // )
    // } else if (k == 'Colour') {
    //   await PriceChart.updateOne({ id }, { $set: { color: v } })
    // } else if (k == 'Battery Power Rating') {
    //   await PriceChart.updateOne({ id }, { $set: { battery: v } })
    // } else if (k == 'Item model number') {
    //   await PriceChart.updateOne({ id }, { $set: { model: v } })
    // } else if (k == 'RAM') {
    //   await PriceChart.updateOne({ id }, { $set: { ram: v } })
    // } else if (k == 'Display technology') {
    //   await PriceChart.updateOne({ id }, { $set: { display: v } })
    // } else if (k == 'Date First Available') {
    //   await PriceChart.updateOne({ id }, { $set: { launchDate: v } })
    // }
    // })
    // return {}
  } catch (e) {
    throw new UserInputError(e)
  } finally {
    await browser.close()
  }
}
