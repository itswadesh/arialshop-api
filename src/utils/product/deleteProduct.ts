import { Product, Feature, Option, Variant, Review, Slug } from '../../models'
import { deleteFileFromUrlAll } from '../'

export const deleteProductData = async (doc: any, force: boolean) => {
  //For specifications delete
  if (doc.specifications.length > 0) {
    for (const featureId of doc.specifications) {
      const feature = await Feature.findById(featureId)
      if (feature) feature.remove()
    }
  }
  //For productDetails delete
  if (doc.productDetails.length > 0) {
    for (const featureId of doc.productDetails) {
      const feature = await Feature.findById(featureId)
      if (feature) feature.remove()
    }
  }

  //For option must be deleted
  if (doc.options.length > 0) {
    for (const optionId of doc.options) await Option.findByIdAndDelete(optionId)
  }
  //for variants must be deleted
  if (doc.variants.length > 0) {
    for (const variantId of doc.variants)
      await Variant.findByIdAndDelete(variantId)
  }
  const reviews = await Review.find({ doc: doc._id })
  if (reviews.length > 0) {
    for (const reviewId of reviews) {
      await Review.findByIdAndDelete(reviewId)
    }
  }
  await Product.findByIdAndDelete(doc._id)
  for (const i of doc.images) {
    await deleteFileFromUrlAll({ url: i, force: force })
  }
  if (doc.sizechart) {
    await deleteFileFromUrlAll({ url: doc.sizechart, force: force })
  }
  await Slug.deleteOne({ slug: doc.slug })
}
