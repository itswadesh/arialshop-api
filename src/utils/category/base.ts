import { saveCategoryArtifacts, categoryPoolInProduct } from '..'
import { Category } from '../../models'

//it is used for the category children field updation
export const recurseCategory = async (category: any) => {
  console.log('calling recurseCategory for:', category._id)
  if (category.children) {
    if (category.children.length == 0) {
      return
    } else {
      for (const catId of category.children) {
        const cate = await Category.findById(catId)
        if (cate) {
          await saveCategoryArtifacts(cate)
          await categoryPoolInProduct(cate)
          await recurseCategory(cate)
        }
      }
    }
  } else {
    return
  }
}
