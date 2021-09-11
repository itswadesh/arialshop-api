import { UserInputError } from 'apollo-server-errors'
import puppeteer from 'puppeteer'
const handlebars = require('handlebars')
const fs = require('fs')
const JsBarcode = require('jsbarcode')
const { DOMImplementation, XMLSerializer } = require('xmldom')
var html_to_pdf = require('html-pdf-node')
import dayjs from 'dayjs'
import { fileUploadToAzureBlob } from './media/uploaders/microsoftBlob'
import { Order, Setting } from '../models'
var Readable = require('stream').Readable
import mkdirp from 'mkdirp'
import { WWW_URL, STATIC_PATH } from '../config'
import { createUploadStream } from './media/uploaders/awsS3'

const bufferToStream = async (buffer) => {
  try {
    let stream = new Readable()
    stream.push(buffer)
    stream.push(null)
    return stream
  } catch (e) {
    throw new Error(e)
  }
}

export const generatePDFAndUpload = async (html, fileName, folder) => {
  try {
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })

    const page = await browser.newPage()
    await page.setContent(html)
    //storage selection
    const settings = await Setting.findOne({}).exec()
    if (!settings) return
    let result
    if (settings.storageProvider == 'local') {
      //make sure folder exist or create it
      mkdirp.sync(STATIC_PATH + `/${folder}`)
      // for save in folder
      const pdfExportPath = `${STATIC_PATH}/${folder}/${fileName}.pdf`
      // console.log(WWW_URL, 'pdfExportPath', pdfExportPath)
      await page.pdf({
        path: pdfExportPath,
        // height: 432,
        // width: 288,
        // margin: {
        //   top: 0,
        //   right: 2,
        //   bottom: 0,
        //   left: 0,
        // },
      })
      result = `${WWW_URL}/assets/${folder}/${fileName}.pdf`
    } else if (settings.storageProvider == 's3') {
      const pdfBuffer = await page.pdf({
        // height: 432,
        // width: 288,
        // margin: {
        //   top: 0,
        //   right: 0,
        //   bottom: 0,
        //   left: 0,
        // },
      })
      const stream = await bufferToStream(pdfBuffer)
      //
      const mimetype = 'application/pdf'
      const encoding = ''
      const filePath = folder + '/' + fileName
      const uploadStream = await createUploadStream(filePath, mimetype)
      //@ts-ignore
      stream.pipe(uploadStream.writeStream)
      try {
        result = await uploadStream.promise
        result = result.Location
      } catch (e) {
        console.log('utils/s3.ts Err:::109 ', e.toString())
      }
    } else if (settings.storageProvider == 'azure') {
      const pdfBuffer = await page.pdf({
        // height: 432,
        // width: 288,
        // margin: {
        //   top: 0,
        //   right: 0,
        //   bottom: 0,
        //   left: 0,
        // },
      })
      const stream = await bufferToStream(pdfBuffer)
      result = await fileUploadToAzureBlob(
        stream,
        fileName + '.pdf',
        `${folder}s`
      )
    } else {
      console.log('cloudinary selected')
    }
    await page.close()
    await browser.close()
    return result
  } catch (e) {
    throw new Error(e)
  }
}
export const generatePDFAndUploadHtmlToPdf = async (html, fileName, folder) => {
  try {
    let options = { format: 'A4' }
    let file = { content: html }
    let pdfBuffer = await html_to_pdf.generatePdf(file, options)
    // const browser = await puppeteer.launch({
    //   args: ['--no-sandbox', '--disable-setuid-sandbox'],
    // })
    // const page = await browser.newPage()
    // await page.setContent(html)
    //storage selection
    const settings = await Setting.findOne({}).exec()
    if (!settings) return
    let result
    if (settings.storageProvider == 'local') {
      //make sure folder exist or create it
      mkdirp.sync(STATIC_PATH + `/${folder}`)
      // for save in folder
      const pdfExportPath = `${STATIC_PATH}/${folder}/${fileName}.pdf`
      // console.log(WWW_URL, 'pdfExportPath', pdfExportPath)
      // await page.pdf({ path: pdfExportPath })
      fs.createWriteStream(pdfExportPath).write(pdfBuffer)
      result = `${WWW_URL}/assets/${folder}/${fileName}.pdf`
    } else if (settings.storageProvider == 's3') {
      // const pdfBuffer = await page.pdf()
      const stream = await bufferToStream(pdfBuffer)
      //
      const mimetype = 'application/pdf'
      const encoding = ''
      const filePath = folder + '/' + fileName
      const uploadStream = await createUploadStream(filePath, mimetype)
      //@ts-ignore
      stream.pipe(uploadStream.writeStream)
      try {
        result = await uploadStream.promise
        result = result.Location
      } catch (e) {
        console.log('utils/s3.ts Err:::109 ', e.toString())
      }
    } else if (settings.storageProvider == 'azure') {
      const stream = await bufferToStream(pdfBuffer)
      result = await fileUploadToAzureBlob(
        stream,
        fileName + '.pdf',
        `${folder}s`
      )
    } else {
      console.log('cloudinary selected')
    }
    return result
  } catch (e) {
    throw new Error(e)
  }
}

//Generate and download invoice for order Item Number
export const generateInvoice = async (orderItem) => {
  try {
    let html = fs.readFileSync(
      `${STATIC_PATH}/templates/invoice_template.html`,
      'utf8'
    )

    const orderDetail = await Order.findById(orderItem.orderId)

    const xmlSerializer = new XMLSerializer()
    const barCodeDocument = new DOMImplementation().createDocument(
      'http://www.w3.org/1999/xhtml',
      'html',
      null
    )
    const svgNode = barCodeDocument.createElementNS(
      'http://www.w3.org/2000/svg',
      'svg'
    )
    JsBarcode(svgNode, orderItem.posInvoiceNo, {
      xmlDocument: barCodeDocument,
      height: 40,
      displayValue: false,
    })
    const shippingBarcode = xmlSerializer.serializeToString(svgNode)
    html = html.replace('$$shippingBarcode$$', shippingBarcode)

    JsBarcode(svgNode, orderItem.awbNumber, {
      xmlDocument: barCodeDocument,
      height: 40,
      displayValue: false,
    })
    const awbBarcode = xmlSerializer.serializeToString(svgNode)
    html = html.replace('$$AWBBarcode$$', awbBarcode)

    const data = {
      // orderItem: orderItem.dataValues,
      // orderDetail: orderDetail.dataValues,
      // store: store.dataValues,
      totalAmount: (orderItem.total + (orderItem.shippingCharge || 0)).toFixed(
        2
      ),
      taxAmount: orderItem.tax.toFixed(2),
      price: orderItem.price.toFixed(2),
      total: orderItem.total.toFixed(2),
      discount: orderItem.amount.discount.toFixed(2),
      // taxable_value: orderItem.taxable_value.toFixed(2),
      // cgst: orderItem.cgst.toFixed(2),
      // sgst: orderItem.sgst.toFixed(2),
      // igst: orderItem.igst.toFixed(2),
      cgst_percentage: 0,
      sgst_percentage: 0,
      igst_percentage: 18.0,
      shipping_cost: orderItem.shippingCharge.toFixed(2),
      order_date: dayjs().format('YYYY-MM-DD'),
      transaction_date: orderDetail.paymentTime,
    }
    // console.log('data before insert', data)
    let template = handlebars.compile(html)
    html = template(data)

    const res = await generatePDFAndUpload(
      html,
      orderItem.itemOrderNo,
      'invoice'
    )

    // console.log('res', res)
    return res
  } catch (e) {
    throw new UserInputError(e.message)
  }
}
