import S3 from 'aws-sdk/clients/s3'
import stream from 'stream'
import { ApolloServerFileUploads } from './index'
import request from 'request'
import {
  S3_BUCKET_NAME,
  S3_REGION,
  S3_ACCESS_KEY,
  S3_SECRET,
} from '../../../config'
import { generateRandomFilename } from './microsoftBlob'
const fetch = require('node-fetch')
const bucketName = S3_BUCKET_NAME
const region = S3_REGION
const accessKeyId = S3_ACCESS_KEY
const secretAccessKey = S3_SECRET

const s3 = new S3({
  region,
  accessKeyId,
  secretAccessKey,
})

export const createDestinationFilePath = async (
  folder: string,
  fileName: string,
  mimetype: string,
  encoding: string
) => {
  try {
    const randomName = await generateRandomFilename(
      fileName,
      mimetype,
      encoding
    )
    return folder + '/' + randomName
  } catch (e) {
    console.log('utils/awsS3/createDestinationFilePath Err:::109 ', e) //long string
  }
}

export const createUploadStream = async (key: string, mimetype: string) => {
  try {
    const pass = new stream.PassThrough()
    return {
      writeStream: pass,
      promise: s3
        .upload({
          Bucket: bucketName,
          Key: key,
          Body: pass,
          ContentType: mimetype,
          ContentDisposition: 'inline',
          ACL: 'public-read',
          CacheControl: 'public, max-age=31536000',
        })
        .promise(),
    }
  } catch (e) {
    console.log('utils/awsS3/createUploadStream Err:::109 ', e) //long string
  }
}

// uploads a file to s3
export const singleFileUpload = async (
  parent: any,
  {
    file,
    folder,
  }: {
    file: ApolloServerFileUploads.File
    folder: string
  }
): Promise<ApolloServerFileUploads.UploadedFileResponse> => {
  // console.log('Calling SingleFileUpload with data', file, folder)
  try {
    const { createReadStream, filename, mimetype, encoding } = await file
    const filePath = await createDestinationFilePath(
      folder,
      filename,
      mimetype,
      encoding
    )
    // @ts-ignore
    const stream = createReadStream()
    const uploadStream = await createUploadStream(filePath, mimetype)
    stream.pipe(uploadStream.writeStream)

    const result = await uploadStream.promise
    // console.log('New File Upload URL:: ', result.Location)
    return { filename, mimetype, encoding, url: result.Location }
  } catch (e) {
    console.log('utils/s3.ts Err:::109 ', e)
  }
}

export const multipleUploads = async (
  parent: any,
  { files, folder }: any
): Promise<ApolloServerFileUploads.UploadedFileResponse[]> => {
  try {
    // console.log('multipleUploadsResolver............')
    return Promise.all(
      files.map((f: any) => singleFileUpload(null, { file: f, folder }))
    )
  } catch (e) {
    console.log('utils/blob/multipleUploads Err:::109 ', e) //long string
  }
}

export const fileUploadFromUrlS3 = async ({
  url,
  folder,
}: {
  url: string
  folder: string
}): Promise<ApolloServerFileUploads.UploadedFileResponse> => {
  try {
    // console.log('calling fileUploadFromUrlS3 with data', url, folder)
    const pattern = /^((http|https|ftp):\/\/)/
    const isUrl = pattern.test(url)
    const mimetype = 'image/jpeg'
    const encoding = ''
    let result: any
    const filename = url.substring(url.lastIndexOf('/') + 1)
    if (!isUrl) return { url, mimetype, encoding, filename }
    try {
      // if (!isUrl || url.includes(S3_CDN_URL)) throw 'Not uploading to CDN'
      const filePath = await createDestinationFilePath(
        folder,
        filename,
        mimetype,
        encoding
      )
      let res = await fetch(url, { method: 'HEAD' })
      if (!res.ok) return
      const stream = await request(url)
      const uploadStream = await createUploadStream(filePath, mimetype)
      //@ts-ignore
      stream.pipe(uploadStream.writeStream)
      try {
        result = await uploadStream.promise
      } catch (e) {
        console.log('utils/s3.ts Err:::109 ', e.toString())
      }
      // console.log('result after upload', result)
    } catch (e) {
      console.log('utils/s3.ts Err:::109 ', e.toString())
    }
    if (result) url = result.Location
    return { filename, mimetype, encoding, url }
  } catch (e) {
    console.log('utils/awsS3/fileUploadFromUrlS3 Err:::109 ', e.toString()) //long string
  }
}
