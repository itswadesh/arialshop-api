import axios from 'axios'
import {
  STATIC_PATH,
  VIMEO_ACCESS_TOKEN,
  VIMEO_CLIENT_ID,
  VIMEO_CLIENT_SECRET,
} from '../config'
const Vimeo = require('vimeo').Vimeo
const vimeoClient = new Vimeo(
  VIMEO_CLIENT_ID,
  VIMEO_CLIENT_SECRET,
  VIMEO_ACCESS_TOKEN
)
export const fetchVimeoPlaylist = async (videoID: string) => {
  // This sample app demonstrates how to use live M3U8 functionality through the Vimeo API.
  // It's not adapted for use in a production environment.
  //
  // To work around rate limiting, add caching logic here, like this:
  // if( new Date() > cacheExpireDate ) {
  //    cachedLink = /* see logic bellow */
  //    cacheExpireDate = (new Date()) + 10; // valid for 10 seconds
  // }
  // return cachedLink
  try {
    const resp = await axios(
      `https://api.vimeo.com/me/videos/${videoID}/m3u8_playback`,
      { headers: { Authorization: `Bearer ${VIMEO_ACCESS_TOKEN}` } }
    )
    if (resp.status !== 200) {
      throw new Error('server error')
    }
    console.log('zzzzzzzzzzzzzzzzzzzzzzzzzzz', resp)
    const link = resp.data.m3u8_playback_url
    console.log(link)
    return link
  } catch (e) {
    throw new Error('Video not found')
  }
}
export const getVimeoLink = async (uri: string) => {
  return new Promise((resolve, reject) => {
    vimeoClient.request(
      uri + '?fields=link',
      function (error: any, body: any, statusCode: number, headers: any) {
        if (error) {
          console.log('There was an error making the request.')
          reject('Server reported: ' + error)
        }
        console.log('Your video link is: ' + body.link)
        resolve(body.link)
      }
    )
  })
}
export const uploadToVimeo = async (filename: string) => {
  return new Promise((resolve, reject) => {
    return vimeoClient.upload(
      STATIC_PATH + filename,
      {},
      function (uri: string) {
        console.log('Your video URI is: ' + uri)
        resolve(uri)
      },
      function (bytesUploaded: number, bytesTotal: number) {
        const percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2)
        console.log(bytesUploaded, bytesTotal, percentage + '%')
        // resolve({bytes_uploaded, bytesTotal, percentage:percentage + '%'})
      },
      function (error: Error) {
        console.log('Failed because: ' + error)
        reject(error)
      }
    )
  })
}
export const transcodeVimeo = async (uri: string) => {
  return new Promise((resolve, reject) => {
    vimeoClient.request(
      uri + '?fields=transcode.status',
      function (error: any, body: any, statusCode: number, headers: any) {
        if (body.transcode.status === 'complete') {
          console.log('Your video finished transcoding.')
          resolve('video finished transcoding.')
        } else if (body.transcode.status === 'in_progress') {
          console.log('Your video is still transcoding.')
          resolve('video is still transcoding.')
        } else {
          console.log('Your video encountered an error during transcoding.')
          resolve('video encountered an error during transcoding.')
        }
      }
    )
  })
}
