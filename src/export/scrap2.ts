const cheerio = require('cheerio')
const puppeteer = require('puppeteer')
;(async function main() {
  const url = `https://www.toysrus.co.za/barbie/`
  try {
    const browser = await puppeteer.launch({
      headless: false,
      devtools: true,
      defaultViewport: {
        width: 1100,
        height: 1000,
      },
    })

    const page = await browser.newPage()
    await page.goto(url, { timeout: 60000 })
    await page.waitForSelector('.products.list.items.product-items')
    const content = await page.content()
    // console.log('all Front cpde of page is:', content)
    const $ = cheerio.load(content)
    const links = []
    const products = $('.item.product.product-item')
    console.log('RR', products.length)
    products.each(async (el) => {
      const link = await $(el).find('a').attr('href')
      const link_text = await $(el).find('a').text().trim()
      //   await page.goBack()
      links.push(link)
    })
    console.log(links)
    for (const { link } of links) {
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
    }
    // for (var i = 1; i < 2; i++) {
    //   const products = await page.$$('.item.product.product-item')
    //   for (const product of products) {
    //     const link = await product.$eval(
    //       '.product-item-info > a',
    //       (link) => link.href
    //     )

    //     await Promise.all([
    //       page.waitForNavigation(),
    //       page.goto(link),
    //       page.waitForSelector('.page-title'),
    //     ])

    //     const info = await page.$eval('h1', (e) => e.innerText)

    //     const data = [
    //       {
    //         information: info,
    //       },
    //     ]

    //     await page.goBack()
    //   }
    //   await Promise.all([
    //     page.waitForNavigation(),
    //     page.click('span.page > a[rel="next"]'),
    //   ])
    // }
  } catch (e) {
    console.log('We have error', e)
  }
})()
