import { UserInputError } from 'apollo-server-errors'
import AWS from 'aws-sdk'
import mkdirp from 'mkdirp'
const request = require('request-promise')
const fsx = require('fs-extra') // Create the directory if not exists
const dload = require('image-downloader')
import { parse, join, normalize, extname, basename, resolve } from 'path'
import { createWriteStream, unlink, ReadStream, PathLike } from 'fs'
const fetch = require('node-fetch')
const fs = require('fs')
import {
  UPLOAD_DIR,
  STATIC_PATH,
  S3_ACCESS_KEY,
  S3_BUCKET_NAME,
  S3_SECRET,
  S3_REGION,
} from '../../config'
import { validate, ifImage } from '../../validation'
mkdirp.sync(STATIC_PATH + UPLOAD_DIR)
import { generateSlug } from '../'
import { generateRandomString } from '../string'
const s3options = {
  accessKeyId: S3_ACCESS_KEY,
  secretAccessKey: S3_SECRET,
  region: S3_REGION,
}
const s3 = new AWS.S3(s3options)

export const imgUrl = (img: any, single: boolean) => {
  const url = '/images'
  if (!img) return
  else if (single) return url + img
  else if (img.constructor === Array)
    return img.map((i: any) => {
      return {
        small: url + i.small,
        medium: url + i.medium,
        large: url + i.large,
      }
    })
  // If a single object than an array
  else
    return {
      small: url + img.small,
      medium: url + img.medium,
      large: url + img.large,
    }
}
export const store1ToFileSystem = async (args: {
  file: any
  folder: string
}) => {
  console.log('calling store1ToFileSystem', args)
  const folder = args.folder || 'img'
  mkdirp.sync(STATIC_PATH + UPLOAD_DIR + '/' + folder)
  let { createReadStream, filename, mimetype, encoding } = await args.file
  await validate(ifImage, { filename, mimetype, encoding })
  const stream = createReadStream()
  const id = generateRandomString(12)
  filename = `${UPLOAD_DIR}${folder}/${filename}-${id}`
  const path = `${STATIC_PATH + filename}`
  const file = { filename, mimetype, encoding, url: filename }
  try {
    await fileWriteRequest(stream, path)
  } catch (error) {}
  return file
}
export const store1CSVToFileSystem = async (args: { file: any }) => {
  console.log('calling store1CSVToFileSystem', args)
  const folder = 'excel'
  mkdirp.sync(STATIC_PATH + UPLOAD_DIR + '/' + folder)
  let { createReadStream, filename, mimetype, encoding } = await args.file
  const stream = createReadStream()
  const id = generateRandomString(12)
  let { ext, name } = parse(filename)
  name = await generateSlug(name, 'category', '', 'string', null)
  filename = `${UPLOAD_DIR}${folder}/${name}-${id}${ext}`
  const path = `${STATIC_PATH + filename}`
  const file = { filename, mimetype, encoding, url: filename }
  try {
    await fileWriteRequest(stream, path)
  } catch (error) {}
  return file
}
const createDestinationFilePath = async (
  folder: string,
  fileName: string,
  mimetype: string,
  encoding: string
): Promise<string> => {
  console.log('calling createDestinationFilePath', folder, fileName)
  let { ext, name } = parse(fileName)
  name = await generateSlug(name, 'category', '', 'string', null)
  const randomName = name + '-' + generateRandomString(12) + ext
  return join(folder, randomName)
}
export const storeToFileSystem = async (args: {
  files: any
  folder: string
}) => {
  console.log('calling storeToFileSystem', args)
  const folder = args.folder || 'img'
  mkdirp.sync(STATIC_PATH + UPLOAD_DIR + '/' + folder)
  const files: any[] = []
  for (const f of args.files) {
    const { createReadStream, filename, mimetype, encoding }: any = await f
    const stream = createReadStream()
    const filePath = await createDestinationFilePath(
      folder,
      filename,
      mimetype,
      encoding
    )
    const fileName = `${UPLOAD_DIR}${filePath}`
    const relativePath = `${STATIC_PATH + fileName}`
    try {
      // Store the file in the filesystem.
      await new Promise((resolve, reject) => {
        // Create a stream to which the upload will be written.
        const writeStream = createWriteStream(relativePath)

        // When the upload is fully written, resolve the promise.
        writeStream.on('finish', resolve)

        // If there's an error writing the file, remove the partially written file
        // and reject the promise.
        writeStream.on('error', (error) => {
          unlink(relativePath, () => {
            reject(error)
          })
        })

        // In Node.js <= v13, errors are not automatically propagated between piped
        // streams. If there is an error receiving the upload, destroy the write
        // stream with the corresponding error.
        stream.on('error', (error: any) => writeStream.destroy(error))

        // Pipe the upload into the write stream.
        stream.pipe(writeStream)
      })
      files.push({
        filename,
        mimetype,
        encoding,
        url: relativePath.replace(STATIC_PATH, '').replace(`\\`, '/'),
      })
    } catch (error) {
      console.log('fileUpload err.........', error)
    }
  }
  return files
}

const fileWriteRequest = async (stream: any, path: PathLike) => {
  console.log('calling fileWriteRequest', stream, path)
  // return new Promise((resolve, reject) => {
  const writeStream = await createWriteStream(path)
  // writeStream.on('finish', resolve)
  // writeStream.on('error', (error) => {
  //   unlink(path, () => {
  //     reject(error)
  //   })
  // })
  // stream.on('error', (error: Error) => writeStream.destroy(error))
  stream.pipe(writeStream)
  // })
  //   .then(() => {
  //     return path
  //   })
  //   .catch((e: Error) => {
  //     throw new UserInputError(e)
  //   })
}
export const generateImg = async (
  imgUrls: any[],
  subdirectory: string,
  datewise: boolean
) => {
  console.log('calling generateImg')
  const imageCollection = []
  let finalDir = subdirectory + '/'
  if (datewise) {
    finalDir += getDate() + '/'
  }
  await createFolder(UPLOAD_DIR + '/' + finalDir) // images/product/090919
  for (const i of imgUrls) {
    if (i) {
      let img = null,
        name,
        url
      if (i.name) {
        // If images is uploaded one. e.g. media.controller.ts
        name = i.name
        url = i.path.replace(/\\/g, '/')
      } else {
        url = name = i
      }
      const filename =
        basename(name).split('.')[0] +
        '-' +
        Math.floor(new Date().valueOf() * Math.random()) +
        extname(name)
      // if (url && url.substr(0, 15) == subdirectory + '/large/') { // If imported from excel sheet
      //     continue
      // }
      img = '/' + finalDir + filename
      if (img.indexOf('?') > 0) img = img.substring(0, img.indexOf('?')) // Remove anything after ?
      try {
        await fsx.moveSync(url, UPLOAD_DIR + '/' + finalDir + filename, {
          overwrite: true,
        })
      } catch (e) {
        // console.log('Image upload err:: ', e.toString());
      }
      try {
        const pattern = /^((http|https|ftp):\/\/)/
        const isUrl = pattern.test(url)
        if (isUrl) await download(url, UPLOAD_DIR + '/' + finalDir + filename)
        imageCollection.push(img)
      } catch (e) {
        throw new UserInputError(e)
        // console.log('Image from URL err:: ', e.toString());
      }
    }
  }
  return imageCollection
}
const download = async (url: string, dest: string) => {
  if (url.indexOf('?') > 0) url = url.substring(0, url.indexOf('?')) // Remove anything after ?
  if (dest.indexOf('?') > 0) dest = dest.substring(0, dest.indexOf('?')) // Remove anything after ?
  try {
    const res = await request.head(url)
    if (!res) return
    const contentType = res['content-type']
    // console.log('contentType:::', contentType);
    if (
      contentType == 'image/jpeg' ||
      contentType == 'image/gif' ||
      contentType == 'image/png' ||
      contentType == 'image/ico' ||
      contentType == 'image/webp'
    ) {
      await dload({ url, dest })
    }
  } catch (e) {
    throw new UserInputError(e)
  }
}
export const deleteFileFromS3 = async (url: string) => {
  console.log('the delete image from s3 url is:', url)
  let deleted = null
  try {
    deleted = await fsx.unlinkSync(url)
  } catch (e) {
    const AmazonS3URI = require('amazon-s3-uri')
    try {
      const { region, bucket, key } = AmazonS3URI(url)
      try {
        const params: any = {
          Bucket: bucket,
          Key: key,
        }
        deleted = await s3.deleteObject(params).promise()
      } catch (e) {
        console.log('Errs:: Delete from S3', e.toString())
        throw new UserInputError(e)
      }
    } catch (err: any) {
      console.warn(`${url} is not a valid S3 uri`) // should not happen because `uri` is valid in that example
    }
    deleted = null
  }
}
export const deleteAllImages = async (images: string[]) => {
  try {
    console.log('calling deleteAllImages')
    if (!images) return
    const deleted = []
    for (const i of images) {
      if (!i) continue
      try {
        const data = await fsx.unlinkSync(UPLOAD_DIR + i)
        deleted.push(data)
      } catch (e) {
        console.error('deleteAllImages:large: Image not found', e.message)
      }
      try {
        const params: any = {
          Bucket: S3_BUCKET_NAME,
          Delete: { Objects: [{ Key: i.substring(1) }] },
        }
        const data: any = await s3.deleteObjects(params).promise()
        deleted.push(...data.Deleted)
      } catch (e) {
        console.log('Err:: Delete from S3', e.toString())
        throw new UserInputError(e)
      } finally {
      }
    }
    return deleted
  } catch (e) {
    throw new UserInputError(e)
  }
}

export const deleteFileFromLocal = async (url: string) => {
  const link = STATIC_PATH + url
  console.log('calling deleteFileFromLocal')
  try {
    fs.unlinkSync(link)
    console.log('Successfully deleted the file.')
  } catch (e) {
    throw new UserInputError(e)
  }
}

const readFile = async (url: string) => {
  const pattern = /^((http|https|ftp):\/\/)/
  const isUrl = pattern.test(url)
  try {
    let stream
    if (isUrl) {
      stream = await request({ url, encoding: null })
    } else {
      stream = await fsx.createReadStream(resolve(url))
      stream.on('error', function (err: Error) {})
    }
    return stream
  } catch (e) {
    // console.log('readFileError...', e.toString());
    return
  }
}

export const checkIfImage = async (photos: any[]) => {
  const p = await photos.map((photo) => {
    if (
      !photo ||
      !photo.originalFilename
        .toLowerCase()
        .match(/\.(jpg|jpeg|png|gif|webp|ico)$/)
    ) {
      throw 'Only image files are allowed!'
    } else {
      return photo //{ name: photo.originalFilename, path: photo.path.replace(/\\/g, "/").replace(UPLOAD_DIR, '') }
    }
  })
  return p
}

export const createFolder = async (path: string) => {
  console.log('calling createFolder')
  try {
    if (!fsx.existsSync(path)) fsx.ensureDirSync(path)
  } catch (e) {
    console.log('Directory creation error ', e)
  }
}
function getDate() {
  const today = new Date()
  const dd = today.getDate()
  const mm = today.getMonth() + 1 //January is 0!
  const yyyy = today.getFullYear()
  let dd1 = ''
  let mm1 = ''
  if (dd < 10) {
    dd1 = '0' + dd
  } else {
    dd1 = '' + dd
  }
  if (mm < 10) {
    mm1 = '0' + mm
  } else {
    mm1 = '' + mm
  }
  return dd1 + mm1 + yyyy
}
// function isURL(url) {

//     return false
// }
