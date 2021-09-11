import { Product } from '../../models'

//this function used for select img from images field
export const setImgFromImages = async (doc: any) => {
  try {
    // console.log('calling the await setImgFromImages and doc is:', doc)
    let images = doc.images
    const img = doc.img
    if (img == null) {
      // console.log('img null so I am choosing from images[0]')
      if (typeof images == 'string') {
        images = [images]
      }
      if (images == undefined) {
        images = []
      }
      if (images.length > 0) doc.img = images[0]
    }

    if (!images.includes(img)) {
      // console.log('img not in the images array so img choose from images[0]')
      if (images.length > 0) doc.img = images[0]
    }
    if (images.length == 0) {
      if (img) images.push(img)
      else doc.img = undefined
      //   // console.log('images lengths is 0 so img also be null ')
    }
    // console.log('doc before update is:', doc)
    return doc
  } catch (e) {
    console.log('Image update err:::::::::::::', e.toString())
  }
}

//this function used for select img from images field
export const setCategoryFromCategories = async (doc: any) => {
  try {
    // console.log('calling the await setCategoryFromCategories and doc is:', doc)
    let categories = doc.categories
    const category = doc.category
    if (category == null) {
      // console.log('category null so I am choosing from categories[0]')
      if (typeof categories == 'string') {
        categories = [categories]
      }
      if (categories == undefined) {
        categories = []
      }
      if (categories.length > 0) doc.category = categories[0]
    }

    if (!categories.includes(category)) {
      // console.log('category not in the categories array so category choose from categories[0]')
      if (categories.length > 0) doc.category = categories[0]
    }
    if (categories.length == 0) {
      if (category) categories.push(category)
      else doc.category = undefined
      //   // console.log('categories lengths is 0 so category also be null ')
    }
    // console.log('doc before update is:', doc)
    return doc
  } catch (e) {
    console.log('Image update err:::::::::::::', e.toString())
  }
}
