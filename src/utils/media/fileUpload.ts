import { Media, Setting } from '../../models'
import { fileUploadFromUrlS3 } from './uploaders/awsS3'
import {
  fileUploadFromUrlBlob,
  deleteBlobFromContainer,
} from './uploaders/microsoftBlob'
import { deleteFileFromS3, deleteFileFromLocal } from '.'
import { CDN_URL, AZURE_STORAGE_CDN_URL } from '../../config'
import { isYoutube } from './checkUrl'
//In image upload this is used for pass the link of image with folder then it will return the new link of images
// which comes from out storage(some links not allow to be shifted like- flipart images links)

export const fileUploadFromUrlAll = async ({
  url,
  folder,
}: {
  url: string
  folder: string
}) => {
  try {
    const settings = await Setting.findOne({}).exec()
    if (!settings) return
    let result: any = { url, folder }
    if (isYoutube(url)) return url
    if (settings.storageProvider == 'local') {
      console.log('url upload not upload in local')
    } else if (settings.storageProvider == 's3') {
      if (!url.includes(CDN_URL) && !url.includes(AZURE_STORAGE_CDN_URL)) {
        result = await fileUploadFromUrlS3({ url, folder })
        return result
      }
      return result
    } else if (settings.storageProvider == 'azure') {
      if (!url.includes(AZURE_STORAGE_CDN_URL) && !url.includes(CDN_URL)) {
        result = await fileUploadFromUrlBlob({ url, folder })
        return result
      }
      return result
    } else {
      console.log('cloudinary selected')
    }
  } catch (e) {
    console.log('utils/fileUpload/fileUploadFromUrlAll ', e) //long string
  }
}

//delete file from url (auto select for delete img)
export const deleteFileFromUrlAll = async ({
  url,
  force,
}: {
  url: string
  force: boolean
}) => {
  try {
    console.log('calling deleteFileFromUrlAll', url)
    const link = url
    const settings = await Setting.findOne({}).exec()
    if (!settings) return
    if (link) {
      if (force) {
        try {
          if (link.includes(CDN_URL)) {
            // console.log("link for delete image from s3 is",link)
            return await deleteFileFromS3(link)
          } else if (link.includes(AZURE_STORAGE_CDN_URL)) {
            // console.log("link for delete image from azure is",link)
            return await deleteBlobFromContainer(link)
          } else {
            console.log('delete from assets')
            await deleteFileFromLocal(link)
          }
        } catch (e) {}
      } else {
        if (link.includes(CDN_URL)) {
          // console.log("link for delete image from s3 is",link)
          return await deleteFileFromS3(link)
        } else if (link.includes(AZURE_STORAGE_CDN_URL)) {
          // console.log("link for delete image from azure is",link)
          return await deleteBlobFromContainer(link)
        } else {
          console.log('delete from assets')
          await deleteFileFromLocal(link)
        }
      }
    }
  } catch (e) {
    console.log('utils/fileUpload/deleteFileFromUrlAll ', e) //long string
  }
}
