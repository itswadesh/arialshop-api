import { Autocomplete } from '../../models'

//this function used for select img from images field
export const syncProductAutocompletion = async (product: any) => {
  if (!product) return
  // console.log('calling syncProductKeywords for product id :', product._id, product.keywords)
  const existingKeywords = await Autocomplete.find({ product: product._id })
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
        await Autocomplete.findByIdAndDelete(k._id)
      }
    }
    const needToCreateList: any = list //list after check in existing
    // console.log("new create keywords list",needToCreateList)
    for (const i of needToCreateList) {
      if (i.trim() !== '') {
        const newK = new Autocomplete({
          name: i,
          product: product._id,
          category: null,
          brand: null,
          img: null,
          type: 'product',
          store: product.store,
          storeId: product.store,
        })
        await newK.save()
      }
    }
  } catch (e) {
    console.log('syncProductKeywords err:::::::::::::', e.toString())
  }
}
