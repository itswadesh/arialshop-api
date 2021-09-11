import axios from 'axios'
import JsSha from 'jssha'
import { NETEASE_APP_KEY, NETEASE_APP_SECRET } from '../config'
const getNeteaseHeaders = () => {
  const Nonce = Math.ceil(Math.random() * 1e9)
  const CurTime = Math.ceil(Date.now() / 1000)
  const aaa = `${NETEASE_APP_SECRET}${Nonce}${CurTime}`
  const sha1 = new JsSha('SHA-1', 'TEXT', { encoding: 'UTF8' })
  sha1.update(aaa)
  const CheckSum = sha1.getHash('HEX')
  return {
    'Content-Type': 'application/json;charset=utf-8',
    AppKey: NETEASE_APP_KEY,
    Nonce,
    CurTime,
    CheckSum,
  }
}
export const getNeteaseVideoInfo = async ({ vid }) => {
  const URL = `https://vcloud.163.com/app/vod/video/get`
  const headers = getNeteaseHeaders()
  const params = JSON.stringify({ vid })
  const r: any = (await axios.post(URL, params, { headers })).data
  if (r.code === 200) {
    return r.ret
  } else {
    return null
  }
}
export const getAllNeteaseVideos = async () => {
  const URL = `https://vcloud.163.com/app/vod/video/list`
  const headers = getNeteaseHeaders()
  const params = JSON.stringify({
    currentPage: 1,
    pageSize: 40,
    status: 0,
    type: 0,
  })
  const r: any = (
    await axios.post(URL, params, {
      headers,
    })
  ).data
  if (r.code === 200) {
    return r.ret
  } else {
    return null
  }
}
export const deleteNeteaseTask = async ({ cid }) => {
  const DELETE_TASK_URL = `https://logic-dev.netease.im/v2/api/rooms/${cid}/task`
  const headers = getNeteaseHeaders()
  delete headers['Content-Type']
  const data = {
    taskId: 'u29gdd1f',
  }
  const r: any = (
    await axios.delete(DELETE_TASK_URL, {
      data,
      headers,
    })
  ).data
  console.log('zzzzzzzzzzzzzzzzzzzzzzzzzzz', r)
  return r
}
export const getAllNeteaseTasks = async ({ cid }) => {
  // console.log("g",channelName,typeof  channelName)
  const ALL_TASKS_URL = `https://logic-dev.netease.im/v2/api/rooms/${cid}/tasks`
  const ONE_TASK_URL = `https://logic-dev.netease.im/v2/api/rooms/${cid}/task/u29gdd1f`

  console.log('zzzzzzzzzzzzzzzzzzzzzzzzzzz', ONE_TASK_URL)
  const headers = getNeteaseHeaders()
  delete headers['Content-Type']
  const r: any = (
    await axios.get(ALL_TASKS_URL, {
      headers,
    })
  ).data
  console.log('zzzzzzzzzzzzzzzzzzzzzzzzzzz', r)
  return r
}
export const createNeteaseRoom = async ({
  cname,
  taskId,
  streamUrl,
  record,
  version,
  uid,
}) => {
  // console.log("g",channelName,typeof  channelName)
  const ROOM_URL = 'https://logic-dev.netease.im/v2/api/room'
  const headers = getNeteaseHeaders()
  const roomParams = JSON.stringify({
    channelName: 'cname',
    mode: 2,
    uid: 12345,
  })
  const r: any = (
    await axios.post(ROOM_URL, roomParams, {
      headers,
    })
  ).data
  console.log('zzzzzzzzzzzzzzzzzzzzzzzzzzz', r)
  const PUSH_TASK_URL = `https://logic-dev.netease.im/v2/api/rooms/${r.cid}/task`
  console.log('zzzzzzzzzzzzzzzzzzzzzzzzzzz', PUSH_TASK_URL)
  const layout = {
    canvas: {
      width: 1280,
      height: 720,
      color: 16777215,
    },
    users: [],
    images: [
      {
        url: 'https://yx-web-nosdn.netease.im/quickhtml%2Fassets%2Fyunxin%2Fdefault%2Fother%2FLark2.jpeg',
        x: 250,
        y: 390,
        width: 480,
        height: 300,
        adaption: 1,
      },
    ],
  }

  const params = JSON.stringify({
    taskId,
    streamUrl,
    layout,
    record,
    version,
  })
  const x = (
    await axios.post(PUSH_TASK_URL, params, {
      headers,
    })
  ).data
  console.log('zzzzzzzzzzzzzzzzzzzzzzzzzzz', x)
  return x
}

export const createNeteaseChannel = async ({ channelName }) => {
  // console.log("g",channelName,typeof  channelName)
  const netEaseCreateChannelApiUrl = `https://vcloud.163.com/app/channel/create`
  const headers = getNeteaseHeaders()

  const params = JSON.stringify({
    name: channelName,
    type: 0,
  })
  const { requestId, code, msg, ret } = (
    await axios.post(netEaseCreateChannelApiUrl, params, {
      headers,
    })
  ).data
  const ne = {
    requestId,
    code,
    msg,
    cid: null,
    ctime: null,
    name: null,
    pushUrl: null,
    httpPullUrl: null,
    hlsPullUrl: null,
    rtmpPullUrl: null,
  }
  if (code === 200) {
    ne.cid = ret.cid
    ne.ctime = ret.ctime
    ne.name = ret.name
    ne.pushUrl = ret.pushUrl
    ne.httpPullUrl = ret.httpPullUrl
    ne.hlsPullUrl = ret.hlsPullUrl
    ne.rtmpPullUrl = ret.rtmpPullUrl
    return ne
  } else if (code === 611) {
    throw { code, msg }
  }
}

export const deleteNeteaseChannel = async ({ channelId }) => {
  // console.log("channelId",channelId ,typeof channelId)
  const netEaseCreateChannelApiUrl = `https://vcloud.163.com/app/channel/delete`
  const headers = getNeteaseHeaders()

  const params = JSON.stringify({
    cid: channelId,
  })
  const { requestId, code, msg } = (
    await axios.post(netEaseCreateChannelApiUrl, params, {
      headers,
    })
  ).data
  const ne = {
    requestId,
    code,
    msg,
  }
  if (code === 200) {
    return ne
  } else if (code === 603) {
    throw { code, msg: 'Channel deletion failed' }
  }
}
// export const getNeteaseStreamUrl = async ({ channelName }) => {
//   const netEaseStreamApiUrl = `https://vcloud.163.com/app/channel/create`
//   const Nonce = Math.ceil(Math.random() * 1e9)
//   const CurTime = Math.ceil(Date.now() / 1000)
//   const aaa = `${NETEASE_APP_SECRET}${Nonce}${CurTime}`
//   const sha1 = new JsSha('SHA-1', 'TEXT', { encoding: 'UTF8' })
//   sha1.update(aaa)
//   const CheckSum = sha1.getHash('HEX')
//   const params = JSON.stringify({
//     name: channelName,
//     type: 0,
//   })
//   const { requestId, code, msg, ret } = (
//     await axios.post(netEaseStreamApiUrl, params, {
//       headers: {
//         'Content-Type': 'application/json;charset=utf-8',
//         AppKey: NETEASE_APP_KEY,
//         Nonce,
//         CurTime,
//         CheckSum,
//       },
//     })
//   ).data
//   const ne = {
//     requestId,
//     code,
//     msg,
//     cid: null,
//     ctime: null,
//     name: null,
//     pushUrl: null,
//     httpPullUrl: null,
//     hlsPullUrl: null,
//     rtmpPullUrl: null,
//   }
//   if (code === 200) {
//     ne.cid = ret.cid
//     ne.ctime = ret.ctime
//     ne.name = ret.name
//     ne.pushUrl = ret.pushUrl
//     ne.httpPullUrl = ret.httpPullUrl
//     ne.hlsPullUrl = ret.hlsPullUrl
//     ne.rtmpPullUrl = ret.rtmpPullUrl
//   } else if (code === 611) {
//     console.log('zzzzzzzzzzzzzzzzzzzzzzzzzzz')
//   }
//   return ne
// }
export const getNeteaseToken = async ({ channelName }) => {
  const uid = Math.ceil(Math.random() * 1e5)
  const getTokenUrl = 'https://api.netease.im/nimserver/user/getToken.action'
  const headers = getNeteaseHeaders()
  headers['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8'
  const data = await axios.post(
    getTokenUrl,
    `uid=${uid}&channelName=${channelName}`,
    { headers }
  )
  const d = data.data
  if (d.code !== 200) {
    throw d.desc
  }
  return { uid, token: d.token, appkey: NETEASE_APP_KEY }
}

export const checkBrowser = (type) => {
  const ua = navigator.userAgent.toLowerCase()
  const info = {
    ie: /msie/.test(ua) && !/opera/.test(ua),
    opera: /opera/.test(ua),
    safari: /version.*safari/.test(ua),
    chrome: /chrome/.test(ua),
    firefox: /gecko/.test(ua) && !/webkit/.test(ua),
  }
  return info[type] || false
}
