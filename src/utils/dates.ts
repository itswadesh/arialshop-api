const dayjs = require('dayjs')
const { startT, endT } = require('../config')
export const getStartEndDate3 = (i = 0) => {
  const start = dayjs()
    .subtract(i, 'day')
    .hour(endT.h)
    .minute(endT.m)
    .second(0)
    .millisecond(0)
    .toDate()
  const end = dayjs()
    .subtract(i - 1, 'day')
    .hour(startT.h)
    .minute(startT.m)
    .second(0)
    .millisecond(0)
    .toDate()
  return { start, end }
}
export const getStartEndDate = (i = 0) => {
  let start = dayjs()
    .subtract(1, 'day')
    .hour(endT.h)
    .minute(endT.m)
    .second(0)
    .millisecond(0)
    .toDate()
  let end = dayjs()
    .hour(startT.h)
    .minute(startT.m)
    .second(0)
    .millisecond(0)
    .toDate()
  if (dayjs().hour() >= endT.h) {
    start = dayjs()
      .hour(endT.h)
      .minute(endT.m)
      .second(0)
      .millisecond(0)
      .toDate()
    end = dayjs().toDate()
  }
  return { start, end }
}
export const getStartEndDate2 = () => {
  let start = dayjs()
    .subtract(1, 'day')
    .hour(startT.h)
    .minute(startT.m)
    .second(0)
    .millisecond(0)
    .toDate()
  let end = dayjs()
    .hour(startT.h)
    .minute(startT.m)
    .second(0)
    .millisecond(0)
    .toDate()
  if (dayjs().hour() >= endT.h) {
    start = dayjs()
      .hour(endT.h)
      .minute(endT.m)
      .second(0)
      .millisecond(0)
      .toDate()
    end = dayjs().toDate()
  }
  return { start, end }
}
