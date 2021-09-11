import axios from 'axios'
import { API_URL } from '../config'
import { Channel, Video } from '../models'
import { getNeteaseVideoInfo } from '../utils'
export default async function (req: any, res: any) {
  try {
    // console.log('Netease req.headers.........', req.headers)
    if (!req.body) res.status(200).send(true)
    else {
      console.log('Netease req.body.........', req.body)
      //   console.log('Netease req.body.........', req.body.data.channelName)
      const eventType = req.body.eventType // 3 for recording complete
      const {
        vid,
        taskId,
        cid,
        code,
        pieceIndex,
        type,
        url,
        uid,
        filename,
        size,
        channelName,
        mix,
        channelId,
        md5,
        timestamp,
        substream,
        reason,
        streamUrl,
      } = req.body.data
      if (eventType === 3 && taskId && vid) {
        console.log(
          'zzzzzzzzzzzzzzzzzzzzzzzzzzz',
          pieceIndex,
          type,
          url,
          vid,
          uid,
          filename,
          size,
          channelName,
          mix,
          taskId,
          channelId,
          md5,
          timestamp,
          substream,
          eventType,
          cid,
          code,
          reason,
          streamUrl
        )
        const v = await Video.create({
          pieceIndex,
          type,
          url,
          vid,
          uid,
          filename,
          size,
          channelName,
          mix,
          taskId,
          channelId,
          md5,
          timestamp,
          substream,
          eventType,
          cid,
          code,
          reason,
          streamUrl,
        })
        // console.log('vid...............', vid)
        const vI = await getNeteaseVideoInfo({ vid })
        // console.log('vI...............', vI)
        const channel = await Channel.findOne({ _id: channelName })
        vI.user = channel.user
        vI.title = channel.title
        vI.products = channel.products
        vI.channel = channel._id
        await Video.findOneAndUpdate({ _id: v._id }, { $set: vI })
        await Channel.updateOne(
          { _id: channelName },
          {
            $addToSet: { videos: v._id },
          }
        )
      }
      res.status(200).send('success')
    }
  } catch (e) {
    console.log('Channel Err::', e.toString())
    res.status(200).send('Invalid Channel')
  }
}
