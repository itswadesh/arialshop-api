// import { clearKey } from './cache'
import { Product, Category } from '../../models'
import { generateSlug } from '..'

export const saveCategoryArtifacts = async (doc: any) => {
  console.log('save saveCategoryArtifacts', doc._id)
  if (!doc) return
  if (!doc.level) doc.level = 0
  let newParent: any = null
  if (doc && doc.parent) {
    try {
      // @ts-ignore
      await doc.constructor.updateOne(
        { _id: doc.parent },
        { $addToSet: { children: doc._id } },
        { new: true }
      )
      // @ts-ignore
      newParent = await doc.constructor.findOne({ _id: doc.parent })
    } catch (e) {}
  }
  // Generate my slug
  let parentSlug = ''
  if (
    newParent
    // &&
    // newParent.level != 0
    // myParent.slug != 'foundational' &&
    // myParent.slug != 'preparatory' &&
    // myParent.slug != 'middle' &&
    // myParent.slug != 'secondary' &&
    // myParent.slug != 'boards'
  ) {
    // parentSlug = newParent.slug + ' '
    parentSlug = newParent.name + ' '
  }
  // Always update slug when category hierarchy changes
  if (!doc.refreshSlug) {
    let storeId = null
    if (doc.store) storeId = doc.store
    if (doc.name)
      // && !doc.slug
      doc.slug = await generateSlug(
        parentSlug + doc.name,
        'category',
        doc.slug,
        'string',
        storeId
      )
  } else {
    delete doc.refreshSlug
  }
  let pathA: any = [],
    slugPathA: any = [],
    namePathA: any = []
  // @ts-ignore
  let me = doc //await doc.constructor.findById(doc.parent)
  for (let i = 0; i < 10; i++) {
    if (!me.parent) break
    // @ts-ignore
    const p1 = await doc.constructor.findById(me.parent)
    if (!p1) break
    pathA.push(p1._id)
    slugPathA.push(p1.slug)
    namePathA.push(p1.name)
    pathA = dedupeIDs(pathA)
    slugPathA = dedupeIDs(slugPathA)
    namePathA = unique(namePathA)
    me = p1
  }
  doc.level = pathA.length
  doc.pathA = pathA.reverse()
  doc.path = doc.pathA.join('/').trim()
  doc.slugPathA = slugPathA.reverse()
  doc.slugPath = doc.slugPathA.join('/').trim()
  if (namePathA) {
    doc.namePath =
      doc.name && doc.name.trim() + '/' + namePathA.join('/').trim()
    doc.namePathA = namePathA.reverse()
  }
  // doc.slug = await generateSlug(
  //   namePathA.join('/').trim() + '/' + doc.slug,
  //   doc.slug,
  //   'category'
  // )
  doc.save()
  // @ts-ignore
  await doc.constructor.updateOne(
    // @ts-ignore
    { _id: doc._id },
    // @ts-ignore
    { $pull: { children: doc._id } }
  )
  // clearKey('categories')
  return doc
}

export const unique = (a: Array<string>) => {
  return a.filter(function (item, pos) {
    return a.indexOf(item) == pos
  })
}
export const dedupeIDs = (objectIDs: Array<string>) => {
  const ids: any = {}
  objectIDs.forEach((_id) => (ids[_id && _id.toString()] = _id))
  return Object['values'](ids)
}
