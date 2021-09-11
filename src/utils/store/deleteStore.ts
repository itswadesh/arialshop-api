import { Store, Slug, User } from '../../models'
import { deleteFileFromUrlAll } from '../'

export const deleteStoreData = async (doc: any, force: boolean) => {
  await Store.findByIdAndDelete(doc._id)
  for (const i of doc.images) {
    await deleteFileFromUrlAll({ url: i, force: force })
  }
  if (doc.qrCode) {
    await deleteFileFromUrlAll({ url: doc.qrCode, force: force })
  }
  await Slug.deleteOne({ slug: doc.slug })
}
