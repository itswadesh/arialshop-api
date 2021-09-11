import { UserInputError } from 'apollo-server-errors'
const handlebars = require('handlebars')
const fs = require('fs')
import QRCode from 'qrcode'
import { Setting, Store } from '../models'
import { WWW_URL, STATIC_PATH } from '../config'
import { generatePDFAndUpload } from './'
//
const generateQR = async (text) => {
  try {
    return await QRCode.toDataURL(text)
  } catch (err) {
    console.error(err)
  }
}
//Generate and download invoice for order Item Number
export const generateQRCode = async (store) => {
  try {
    let html = fs.readFileSync(
      `${STATIC_PATH}/templates/qr_template.html`,
      'utf8'
    )
    const settings = await Setting.findOne({}).exec()
    if (!settings) throw new Error('invalid config')
    const qrCode = await generateQR(`http://${store.domain}`)
    const data = {
      storeName: store.name,
      storeDomain: store.domain,
      qrCode,
      logo: settings.logo,
    }
    let template = handlebars.compile(html)
    html = template(data)
    const res = await generatePDFAndUpload(
      html,
      store.domain,
      `stores/${store._id}/qrcode`
    )
    return res
  } catch (e) {
    throw new UserInputError(e.message)
  }
}
