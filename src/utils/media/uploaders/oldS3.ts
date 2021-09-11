import AWS from 'aws-sdk'
import stream from 'stream'
import * as path from 'path'
import request from 'request-promise'
import { ApolloServerFileUploads } from './index'
import { generateRandomString } from '../../string'

type S3UploadConfig = {
  accessKeyId: string
  secretAccessKey: string
  region?: string
  destinationBucketName: string
}

type S3UploadStream = {
  writeStream: stream.PassThrough
  promise: Promise<AWS.S3.ManagedUpload.SendData>
}

export class AWSS3Uploader implements ApolloServerFileUploads.IUploader {
  private s3: AWS.S3
  public config: S3UploadConfig

  constructor(config: S3UploadConfig) {
    AWS.config = new AWS.Config()
    AWS.config.update({
      region: config.region || 'ap-south-1',
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    })

    this.s3 = new AWS.S3()
    this.config = config
  }

  private createUploadStream(key: string, mimetype: string): S3UploadStream {
    const pass = new stream.PassThrough()
    return {
      writeStream: pass,
      promise: this.s3
        .upload({
          Bucket: this.config.destinationBucketName,
          Key: key,
          Body: pass,
          ContentType: mimetype,
          ContentDisposition: 'inline',
          ACL: 'public-read',
          CacheControl: 'public, max-age=31536000',
        })
        .promise(),
    }
  }

  public createDestinationFilePath(
    folder: string,
    fileName: string,
    mimetype: string,
    encoding: string
  ): string {
    const { ext, name } = path.parse(fileName)
    const updatedName = name
      .toString()
      .toLowerCase()
      .replace(/\s+/g, '-') // Replace spaces with -
      .replace(/[^\w\-]+/g, '') // Remove all non-word chars
      .replace(/\-\-+/g, '-') // Replace multiple - with single -
      .replace(/^-+/, '') // Trim - from start of text
      .replace(/-+$/, '')
    const randomName = updatedName + '-' + generateRandomString(12) + ext
    return folder + '/' + randomName
  }

  fileUploadFromUrlS3 = async ({
    url,
    folder,
  }: {
    url: string
    folder: string
  }): Promise<ApolloServerFileUploads.UploadedFileResponse> => {
    console.log('data is', url, folder)
    const pattern = /^((http|https|ftp):\/\/)/
    const isUrl = pattern.test(url)
    const mimetype = 'image/jpeg'
    const encoding = ''
    let result: any
    const filename = url.substring(url.lastIndexOf('/') + 1)
    // if (!isUrl) throw new UserInputError('Invalid Image URL')
    if (!isUrl) return { url, mimetype, encoding, filename }
    try {
      console.log('the imgs 0:', isUrl)

      // if (!isUrl || url.includes(S3_CDN_URL)) throw 'Not uploading to CDN'
      // console.log('the imgs 1:', isUrl)

      const filePath = this.createDestinationFilePath(
        folder,
        filename,
        mimetype,
        encoding
      )
      // console.log('the imgs 2:', isUrl)
      const stream = await request(url)
      // console.log('the imgs 3:', isUrl)

      const uploadStream = this.createUploadStream(filePath, mimetype)
      // console.log('the imgs 4:', isUrl)

      stream.pipe(uploadStream.writeStream)
      // console.log('the imgs 5:', isUrl)

      result = await uploadStream.promise
      // console.log('the imgs 6:', isUrl)

      console.log('New File Upload URL:: ', result.Location)
    } catch (e) {
      console.log('utils/s3.ts Err:::109 ', e.toString())
    }
    if (result) url = result.Location
    return { filename, mimetype, encoding, url }
  }

  singleFileUploadResolver = async (
    parent: any,
    {
      file,
      folder,
    }: {
      file: ApolloServerFileUploads.File
      folder: string
    }
  ): Promise<ApolloServerFileUploads.UploadedFileResponse> => {
    console.log('SingleFile..............', file, folder)
    const { createReadStream, filename, mimetype, encoding } = await file

    const filePath = this.createDestinationFilePath(
      folder,
      filename,
      mimetype,
      encoding
    )
    // @ts-ignore
    const stream = createReadStream()
    const uploadStream = this.createUploadStream(filePath, mimetype)
    stream.pipe(uploadStream.writeStream)
    // console.log('3333333333333333333', filename)
    // try {
    const result = await uploadStream.promise
    // } catch (e) {
    // }
    console.log('New File Upload URL:: ', result.Location)
    return { filename, mimetype, encoding, url: result.Location }
  }

  async multipleUploadsResolver(
    parent: any,
    { files, folder }: any
  ): Promise<ApolloServerFileUploads.UploadedFileResponse[]> {
    // console.log('multipleUploadsResolver............')
    return Promise.all(
      files.map((f: any) =>
        this.singleFileUploadResolver(null, { file: f, folder })
      )
    )
  }
}
