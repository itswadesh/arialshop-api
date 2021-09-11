import { UserInputError } from 'apollo-server-express'
import { Setting, Subscription, Subscribe } from '../../models'
import { Request, SubscriptionDocument } from '../../types'
import dayjs from 'dayjs'
import { sendMail } from '../email'

export const createSubscribe = async (
  req: Request,
  { subscriptionId }: any
) => {
  console.log('calling createSubscribe')
  try {
    const { userId } = req.session
    const subscription: SubscriptionDocument = await Subscription.findById(
      subscriptionId
    )
    if (!subscription) throw new Error('Subscription not found')
    const currentMonthDays = dayjs().daysInMonth()
    const subscribeData: any = {}
    subscribeData.user = userId
    subscribeData.subscription = subscriptionId
    subscribeData.amount = subscription.monthlyPrice
    subscribeData.daysLeft = currentMonthDays
    //check that user already has subscription on not
    const result: any = await Subscribe.find({
      user: userId,
      EndTimeISO: { $gt: new Date() },
    })
    // console.log("result", result)
    if (result.length == 0) {
      subscribeData.daysLeft = subscribeData.daysLeft - 1
      const now = new Date()
      // console.log('Today: ' + now.toUTCString(), 'now', now,'ISOString',now.toISOString())
      const nextdays = new Date(now.setDate(now.getDate() + currentMonthDays))
      // console.log('Next 30th day: ' + nextdays.toUTCString(),'next30days',nextdays)
      subscribeData.StartTime = new Date().toUTCString()
      subscribeData.EndTime = nextdays.toUTCString()
      subscribeData.StartTimeISO = new Date().toISOString()
      subscribeData.EndTimeISO = nextdays.toISOString()
    } else {
      const start = new Date(
        result[result.length - 1].EndTimeISO.setDate(
          result[result.length - 1].EndTimeISO.getDate() + 1
        )
      )
      const end = new Date(
        result[result.length - 1].EndTimeISO.setDate(
          result[result.length - 1].EndTimeISO.getDate() + currentMonthDays + 1
        )
      )
      subscribeData.StartTime = start.toUTCString()
      subscribeData.EndTime = end.toUTCString()
      subscribeData.StartTimeISO = start.toISOString()
      subscribeData.EndTimeISO = end.toISOString()
    }
    // console.log('subscribeData',subscribeData)
    //create subcribe table
    return await Subscribe.create(subscribeData)
  } catch (e) {
    throw new UserInputError(e)
  }
}

// in case subscribe payment confirmed
export const confirmSubscribe = async (subscribeId) => {
  try {
    const subscribe = await (
      await Subscribe.findById(subscribeId)
    ).populated('user subscription')
    if (!subscribe) throw new UserInputError('Subscribe  not found')
    await Subscribe.findByIdAndUpdate(subscribeId, { $set: { paid: true } })

    const settings = await Setting.findOne()
    if (subscribe.user && subscribe.user.email)
      sendMail({
        to: subscribe.user.email,
        subject: settings.websiteName + 'Subscription Activated Successfully',
        template: 'order/created',
        context: {
          subscribeNo: subscribeId,
          createdAt: subscribe.createdAt,
          item: subscribe.subscription,
          amount: subscribe.amount,
        },
      })
  } catch (e) {
    console.log('Confirm Subscription error...........', e)
  }
}
