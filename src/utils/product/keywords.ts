import { Keyword } from '../../models'

//this function used for select img from images field
export const syncProductKeywords = async (product: any) => {
  if (!product) return
  // console.log('calling syncProductKeywords for product id :', product._id, product.keywords)
  const existingKeywords = await Keyword.find({ product: product._id })
  try {
    const latestKeywords = product.keywords
    let list: any = []
    if (latestKeywords) {
      if (latestKeywords.includes(',')) {
        list = latestKeywords.trim('').split(',')
      } else {
        list = [latestKeywords.trim('')]
      }
    }

    // console.log("existingKeywords",existingKeywords,"and latestKeywords",list)
    //
    for (const k of existingKeywords) {
      if (list.includes(k.name)) {
        list = list.filter(function (item) {
          return item !== k.name
        })
      } else {
        await Keyword.findByIdAndDelete(k._id)
      }
    }
    const needToCreateList: any = list //list after check in existing
    // console.log("new create keywords list",needToCreateList)
    for (const i of needToCreateList) {
      if (i.trim() !== '') {
        const newK = new Keyword({
          name: i,
          product: product._id,
          category: product.category,
          brand: product.brand,
        })
        await newK.save()
      }
    }
  } catch (e) {
    console.log('syncProductKeywords err:::::::::::::', e.toString())
  }
}
