import { Slug } from '../models'
import { SlugDocument } from './../types'
export const generateSlug = async (
  str: string,
  type: string,
  currentSlug: string,
  slugType: string,
  store: string
) => {
  // console.log(
  //   'slugtype',
  //   slugType,
  //   'str',
  //   str,
  //   'type',
  //   type,
  //   'currentSlug',
  //   currentSlug
  // )

  if (str.includes('undefined')) {
    str = str.replace(/undefined/g, '').trim()
    if (str.length == 0) return ''
  }
  if (str.includes('null')) {
    str = str.replace(/null/g, '').trim()
    if (str.length == 0) return ''
  }

  if (!str) return ''
  //for category slug type
  if (slugType == 'category') {
    await Slug.deleteMany({ slug: currentSlug })
    const s = new Slug({ slug: str, type: type, store: store })
    await s.save()
    return s.slug
  }

  const rawSlug = str
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, '')
  try {
    let newSlug = rawSlug
    let foundSlug: SlugDocument | null
    do {
      await Slug.deleteMany({ slug: currentSlug })
      if (type === 'store') {
        foundSlug = await Slug.findOne({ slug: newSlug, type: 'store' })
      } else {
        foundSlug = await Slug.findOne({ slug: newSlug, store: store })
      }
      if (foundSlug) {
        //For number slug type
        if (slugType == 'number') {
          const arr = newSlug.split(/(\d+)/)
          if (arr[1] == undefined) newSlug = newSlug + '1'
          else {
            const num = (parseInt(arr[1]) + 1).toString()
            newSlug = arr[0] + num
          }
        } else {
          //For string slug type
          newSlug = newSlug + '-en'
        }
      }
    } while (foundSlug)
    const s = new Slug({ slug: newSlug, type: type, store: store })
    await s.save()
    // await Slug.create({ slug: 'newSlug' })
    return newSlug
  } catch (e) {
    return rawSlug
  }
}
