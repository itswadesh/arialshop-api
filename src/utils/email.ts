import { Setting } from '../models'
import { SettingsDocument } from '../types'
import { UserInputError } from 'apollo-server-express'
import Puppeteer from 'puppeteer'
import Handlebars, { helpers } from 'handlebars'
import fsx from 'fs-extra'
import {
  SMTP_OPTIONS,
  MAIL_FROM,
  SENDGRID_API_KEY,
  STATIC_PATH,
} from '../config'
const nodemailer = require('nodemailer')
const hbs = require('nodemailer-express-handlebars')
const hbsOptions = {
  viewEngine: {
    extname: '.hbs',
    layoutsDir: `${STATIC_PATH}/templates/`,
    defaultLayout: 'default',
    partialsDir: `${STATIC_PATH}/templates/partials/`,
    helpers,
  },
  viewPath: `${STATIC_PATH}/templates/`,
  extName: '.hbs',
}

const transporter = nodemailer.createTransport(SMTP_OPTIONS)
transporter.use('compile', hbs(hbsOptions))

export const sendMail = async ({
  to,
  cc = null,
  bcc = null,
  subject,
  template,
  context,
  attachments = [],
}: any) => {
  if (!SENDGRID_API_KEY) {
    return 'Sendgrid API key not set at .env'
  }
  const settings = await Setting.findOne()
  if (!settings || !settings.email || !settings.email.enabled || !to) return
  try {
    const info = await transporter.sendMail({
      from: MAIL_FROM,
      to,
      cc,
      bcc,
      subject,
      template,
      context,
      attachments,
    })
    console.log('email sent...', info)
    return info
  } catch (e) {
    console.log('email err..', e.toString())
    return false
  }
}
export const emailWithPdf = async ({
  to,
  subject,
  emailTemplate,
  context,
  attachmentTemplate,
  pdfExportPath,
  attachmentFileName,
}: any) => {
  try {
    const settings: SettingsDocument | null = await Setting.findOne()
    const html = await toHtml({ context, attachmentTemplate })
    const browser = await Puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })
    const page = await browser.newPage()
    await page.setContent(html)
    await page.pdf({ path: pdfExportPath })
    await browser.close()
    if (!settings) throw new UserInputError('Invalid settings')
    const emailObj: any = {
      to,
      cc: settings.email.cc,
      bcc: settings.email.bcc,
      subject,
      template: emailTemplate,
      context,
      attachments: [
        {
          // file on disk as an attachment
          filename: attachmentFileName,
          path: pdfExportPath,
        },
      ],
    }
    try {
      await sendMail(emailObj)
    } catch (e) {
      console.log('Email error...', e)
    }
  } catch (e) {
    console.log('email conversion err...', e)
  }
}
const toHtml = async ({ context, attachmentTemplate }: any) => {
  try {
    const content = await fsx.readFile(attachmentTemplate, 'utf8')
    Handlebars.registerHelper('date', helpers.date)
    Handlebars.registerHelper('subtract', helpers.subtract)
    Handlebars.registerHelper('multiply', helpers.multiply)
    const template = Handlebars.compile(content)
    return template(context)
  } catch (e) {
    console.log('err converting html...', e)
    throw new Error(e)
  }
}
