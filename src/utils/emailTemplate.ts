// Load the AWS SDK for Node.js
import AWS from 'aws-sdk'
import {
  ITEMS_COUNT,
  S3_BUCKET_NAME,
  S3_REGION,
  S3_ACCESS_KEY,
  S3_SECRET,
} from '../config'

export const ListingEmailTemplate = (str: string) => {
  // Set the region
  AWS.config.update({ region: S3_REGION })
  // Create the promise and SES service object
  var templatePromise = new AWS.SES({ apiVersion: '2010-12-01' })
    .listTemplates({ MaxItems: ITEMS_COUNT })
    .promise()

  // Handle promise's fulfilled/rejected states
  templatePromise
    .then(function (data) {
      console.log(data)
    })
    .catch(function (err) {
      console.error(err, err.stack)
    })
}

export const gettingAnEmailTemplate = (templateName: string) => {
  // Set the region
  AWS.config.update({ region: S3_REGION })

  // Create the promise and Amazon Simple Email Service (Amazon SES) service object.
  var templatePromise = new AWS.SES({ apiVersion: '2010-12-01' })
    .getTemplate({ TemplateName: templateName })
    .promise()

  // Handle promise's fulfilled/rejected states
  templatePromise
    .then(function (data) {
      console.log(data.Template.SubjectPart)
    })
    .catch(function (err) {
      console.error(err, err.stack)
    })
}

export const creatingAnEmailTemplate = (
  templateName: string,
  htmlContent: string
) => {
  // Set the region
  AWS.config.update({ region: S3_REGION })
  // Create createTemplate params
  var params = {
    Template: {
      TemplateName: templateName /* required */,
      HtmlPart: htmlContent,
      SubjectPart: 'SUBJECT_LINE',
      TextPart: 'TEXT_CONTENT',
    },
  }

  // Create the promise and SES service object
  var templatePromise = new AWS.SES({ apiVersion: '2010-12-01' })
    .createTemplate(params)
    .promise()

  // Handle promise's fulfilled/rejected states
  templatePromise
    .then(function (data) {
      console.log('data', data)
    })
    .catch(function (err) {
      console.error(err, err.stack)
    })
}

export const updatingAnEmailTemplate = (
  templateName: string,
  htmlContent: string
) => {
  // Set the region
  AWS.config.update({ region: S3_REGION })
  // Create updateTemplate parameters
  var params = {
    Template: {
      TemplateName: templateName /* required */,
      HtmlPart: htmlContent,
      SubjectPart: 'SUBJECT_LINE',
      TextPart: 'TEXT_CONTENT',
    },
  }

  // Create the promise and SES service object
  var templatePromise = new AWS.SES({ apiVersion: '2010-12-01' })
    .updateTemplate(params)
    .promise()

  // Handle promise's fulfilled/rejected states
  templatePromise
    .then(function (data) {
      console.log('Template Updated')
    })
    .catch(function (err) {
      console.error(err, err.stack)
    })
}

export const deletingAnEmailTemplate = (templateName: string) => {
  // Set the region
  AWS.config.update({ region: S3_REGION })
  // Create the promise and SES service object
  var templatePromise = new AWS.SES({ apiVersion: '2010-12-01' })
    .deleteTemplate({ TemplateName: templateName })
    .promise()

  // Handle promise's fulfilled/rejected states
  templatePromise
    .then(function (data) {
      console.log('Template Deleted')
    })
    .catch(function (err) {
      console.error(err, err.stack)
    })
}
