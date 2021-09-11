// Account > Container(folder) > BlobServiceClient(file)
import { UserInputError } from 'apollo-server-errors'
import * as path from 'path'
import { Readable } from 'stream'
const fetch = require('node-fetch')
import {
  AccessPolicy,
  BlobServiceClient,
  ContainerClient,
} from '@azure/storage-blob'
import { ApolloServerFileUploads } from './index'
import decode from 'urldecode'
import { generateSlug } from '../../slug'

const ONE_MEGABYTE = 1024 * 1024
const uploadOptions = { bufferSize: 4 * ONE_MEGABYTE, maxBuffers: 20 }
import { generateRandomString } from '../../string'
import {
  AZURE_STORAGE_CONNECTION_STRING,
  AZURE_STORAGE_CDN_URL,
} from '../../../config'
// Create the BlobServiceClient object which will be used to create a container client

export const generateRandomFilename = async (
  fileName: string,
  mimetype: string,
  encoding: string
) => {
  try {
    const { ext, name } = path.parse(fileName)
    const nameHyphen = name
      .toString()
      .toLowerCase()
      .replace(/\s+/g, '-') // Replace spaces with -
      .replace(/[^\w\-]+/g, '') // Remove all non-word chars
      .replace(/\-\-+/g, '-') // Replace multiple - with single -
      .replace(/^-+/, '') // Trim - from start of text
      .replace(/-+$/, '')
    const randomName =
      nameHyphen + '-' + generateRandomString(12) + ext.split('?')[0]
    return randomName.toLowerCase()
  } catch (e) {
    console.log('utils/blob/generateRandomFilename Err:::109 ', e.toString()) //long string
  }
}

// Create a container
export const createContainer = async ({
  folder,
}: {
  folder: string
}): Promise<boolean> => {
  try {
    // Create a unique name for the container
    // Create the BlobServiceClient object which will be used to create a container client
    const containerName = folder
    console.log('\nCreating container...', containerName)
    // Concatenate customer key and customer secret and use base64 to encode the concatenated string
    // const plainCredential =
    //   ''

    // // Encode with base64
    // const encodedCredential = Buffer.from(plainCredential).toString('base64')
    // const authorizationField = 'SharedKey ' + encodedCredential

    // const headers = {
    //   // Authorization: authorizationField,
    //   'Content-Type': 'application/json',
    //   // 'x-ms-blob-public-access': 'blob',
    //   'x-ms-meta-Name': 'containerProduct',
    //   Authorization:
    //     'SharedKey myaccount:az3w==',
    // }
    // // @ts-ignore
    // const response = await fetch(
    //   `https://tblzpocstg.blob.core.windows.net/mycontainer?restype=container`,
    //   { headers }
    // )
    // let data = await response.json()
    // console.log('PP', data)
    // Get a reference to a container
    const blobServiceClient = BlobServiceClient.fromConnectionString(
      AZURE_STORAGE_CONNECTION_STRING
    )
    const containerClient = blobServiceClient.getContainerClient(folder)

    // Create the container
    const createContainerResponse = await containerClient.create()
    console.log(
      'Container was created successfully. requestId: ',
      createContainerResponse.requestId
    )
    return true
  } catch (e) {
    console.log('utils/blob/createContainer Err:::109 ', e.toString()) //long string
  }
}

// Upload blobs to a container(file upload)
export const uploadBlobsToContainer = async (
  file: string,
  folder: string
): Promise<ApolloServerFileUploads.UploadedFileResponse> => {
  try {
    const { createReadStream, filename, mimetype, encoding }: any = await file
    // Create a unique name for the blob
    const randomName = await generateRandomFilename(
      filename,
      mimetype,
      encoding
    )
    const blobServiceClient = BlobServiceClient.fromConnectionString(
      AZURE_STORAGE_CONNECTION_STRING
    )
    // Get a block blob client
    const containerClient = blobServiceClient.getContainerClient(folder)
    const blockBlobClient = containerClient.getBlockBlobClient(randomName)

    // console.log('Uploading to Azure storage as blob', blockBlobClient.url)

    const stream = await createReadStream()

    // Upload data to the blob
    const uploadBlobResponse = await blockBlobClient.uploadStream(
      stream,
      uploadOptions.bufferSize,
      uploadOptions.maxBuffers,
      { blobHTTPHeaders: { blobContentType: 'image/jpeg' } }
    )
    // console.log(
    //   'Blob was uploaded successfully. requestId: ',
    //   uploadBlobResponse.requestId
    // )
    return { filename, mimetype, encoding, url: decode(blockBlobClient.url) }
  } catch (e) {
    console.log('utils/blob/uploadBlobsToContainer Err:::109 ', e.toString()) //long string
  }
}

//for invoice we are using it
export const fileUploadToAzureBlob = async (fileStream, fileName, folder) => {
  console.log('calling fileUploadToAzureBlob')
  try {
    const blobServiceClient = BlobServiceClient.fromConnectionString(
      AZURE_STORAGE_CONNECTION_STRING
    )

    const containerClient = blobServiceClient.getContainerClient(folder)
    const blockBlobClient = containerClient.getBlockBlobClient(fileName)
    await blockBlobClient.uploadStream(
      fileStream,
      uploadOptions.bufferSize,
      uploadOptions.maxBuffers,
      { blobHTTPHeaders: { blobContentType: 'application/pdf' } }
    )
    console.log(blockBlobClient.url)
    return decode(blockBlobClient.url)
  } catch (e) {
    console.log(e.message)
    return null
  }
}

export const fileUploadFromUrlBlob = async ({
  url,
  folder,
}: {
  url: string
  folder: string
}): Promise<ApolloServerFileUploads.UploadedFileResponse> => {
  try {
    const pattern = /^((http|https|ftp):\/\/)/
    const isUrl = pattern.test(url)
    const mimetype = 'image/jpeg',
      encoding = '',
      filename = url.substring(url.lastIndexOf('/') + 1)

    // if (!isUrl) throw new Error('Invalid Image URL')
    if (!isUrl) return { url, mimetype, encoding, filename }
    let res = await fetch(url, { method: 'HEAD' })
    if (!res.ok) return
    try {
      // Create a unique name for the blob
      const randomName = await generateRandomFilename(
        filename,
        mimetype,
        encoding
      )

      const blobServiceClient = BlobServiceClient.fromConnectionString(
        AZURE_STORAGE_CONNECTION_STRING
      )
      // Get a block blob client
      const containerClient = blobServiceClient.getContainerClient(folder)
      const blockBlobClient = containerClient.getBlockBlobClient(randomName)
      const response = await blockBlobClient.beginCopyFromURL(url)
      const result = await response.pollUntilDone()
      if (result) {
        url = decode(result._response.request.url)
      }
    } catch (e) {
      console.log('utils/blob.ts Err:::109 ', e.toString()) //long string
    }
    return { filename, mimetype, encoding, url }
  } catch (e) {
    console.log('utils/blob/fileUploadFromUrlBlob Err:::109 ', e.toString()) //long string
  }
}

export const deleteBlobFromContainer = async (url: string) => {
  try {
    const subString = url.replace(`${AZURE_STORAGE_CDN_URL}/`, '')
    const filename = subString.split('/').splice(-1)[0]
    const folder = subString.replace(filename, '').slice(0, -1)

    // console.log('the delete image  from blob url is:',filename,'and folder is:',typeof folder)
    let deleted: any
    const blobServiceClient = BlobServiceClient.fromConnectionString(
      AZURE_STORAGE_CONNECTION_STRING
    )
    const containerClient = await blobServiceClient.getContainerClient(folder)
    const blockBlobClient = containerClient.getBlockBlobClient(filename)
    await blockBlobClient.download(0)
    blockBlobClient.delete()
    // console.log(
    //   await streamToString(downloadBlockBlobResponse.readableStreamBody)
    // )
    // const blobDeleteResponse = blockBlobClient.delete()
    // console.log((await blobDeleteResponse).clientRequestId)
    deleted = null
  } catch (e) {
    console.log('Errs:: Delete from blob', e.toString())
    throw new UserInputError(e)
  }
}

// Download blobs
// export const downloadBlobs = async (): Promise<boolean> => {
//   // Get blob content from position 0 to the end
//   // In Node.js, get downloaded data by accessing downloadBlockBlobResponse.readableStreamBody
//   // In browsers, get downloaded data by accessing downloadBlockBlobResponse.blobBody
//   // @ts-ignore
//  await BlockBlobClient.download(0)
//   console.log('Downloaded blob content...')
//   // console.log(
//   //   await streamToString(downloadBlockBlobResponse.readableStreamBody)
//   // )
//   return true
// }

// A helper function used to read a Node.js readable stream into a string
// const streamToString = async (readableStream: any) => {
//   return new Promise((resolve, reject) => {
//     const chunks: any = []
//     readableStream.on('data', (data: any) => {
//       chunks.push(data.toString())
//     })
//     readableStream.on('end', () => {
//       resolve(chunks.join(''))
//     })
//     readableStream.on('error', reject)
//   })
// }

// A helper function used to read a Node.js a string into readable stream
// const stringToStream = async (stream: any) => {
//   const s = new Readable()
//   s.push(stream) // the string you want
//   s.push(null)
//   return s
// }
// Delete a container
// const deleteContainer = async ({
//   url,
//   folder,
// }: {
//   url: string
//   folder: string
// }): Promise<boolean> => {
//   // console.log('Deleting container...')

//   // Delete container
//   // @ts-ignore
//   const deleteContainerResponse = await ContainerClient.delete()
//   console.log(
//     'Container was deleted successfully. requestId: ',
//     deleteContainerResponse.requestId
//   )
//   return true
// }
