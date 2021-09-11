import { Product, Category } from '../../models'
import { refreshCategoryPool } from '..'

export const categoryPoolInProduct = async (doc: any) => {
  // console.log('calling categoryPoolInProduct', doc._id)
  //responsible for product Pool changes in according to categories
  const products = await Product.find({
    categories: { $in: [doc._id] },
  })
  if (products.length > 0) {
    for (const product of products) {
      // console.log("products pool going to chagne",product.length)
      await refreshCategoryPool(product)
    }
  }
}
