import cloudinary from 'cloudinary'
import { ApolloServerFileUploads } from './index'

type CloudinaryUploadConfig = {
  cloudname: string
  apiKey: any
  apiSecret: string
}

export class CloudinaryUploader implements ApolloServerFileUploads.IUploader {
  private config: CloudinaryUploadConfig

  constructor(config: CloudinaryUploadConfig) {
    this.config = config

    cloudinary.v2.config({
      cloudName: config.cloudname,
      apiKey: config.apiKey,
      apiSecret: config.apiSecret,
    })
  }

  private createUploadStream(fileName: string, cb: Function): any {
    return cloudinary.v2.uploader.upload_stream(
      /**
       * We need a ts-ignore on the next line because for v2,
       * the order of params for upload_stream is reversed.
       */

      { publicId: fileName },
      //@ts-ignore
      (error: any, file: File) => cb(error, file)
    )
  }

  async singleFileUploadResolver(
    parent: any,
    { file }: { file: ApolloServerFileUploads.File }
  ): Promise<ApolloServerFileUploads.UploadedFileResponse> {
    const { stream, filename, mimetype, encoding } = await file

    return new Promise((resolve, reject) => {
      const uploadStream = this.createUploadStream(
        filename,
        (error: any, result: any) => {
          if (error) return reject(error)
          return resolve({
            filename,
            mimetype,
            encoding,
            url: result.url,
          } as ApolloServerFileUploads.UploadedFileResponse)
        }
      )
      // @ts-ignore
      stream.pipe(uploadStream)
    })
  }

  async multipleUploadsResolver(
    parent: any,
    { files }: { files: ApolloServerFileUploads.File[] }
  ): Promise<ApolloServerFileUploads.UploadedFileResponse[]> {
    return Promise.all(
      files.map((f) => this.singleFileUploadResolver(null, { file: f }))
    )
  }
}
