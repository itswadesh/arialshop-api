import {
  IResolvers,
  UserInputError,
  ForbiddenError,
  withFilter,
} from 'apollo-server-express'
import { Request, UserDocument, CartDocument } from '../../types'
import {
  Product,
  Attribute,
  Feature,
  Category,
  ImportDetail,
  Brand,
  User,
  Color,
  Size,
  Store,
} from '../../models'
import {
  dedupeIDs,
  saveCategoryArtifacts,
  categoryPoolInProduct,
  recurseCategory,
  fileUploadFromUrlAll,
} from '..'

export const importCategories = async (
  req: Request,
  { file, filename, importNo, results }: any
) => {
  const { userId } = req.session
  //store
  const user = await User.findById(userId)
  if (!user || !user.store) throw new Error('you have not own a store')

  const store = await Store.findById(user.store)
  if (!store) throw new Error('You have not own a store')

  // console.log("provided data is: ",userId,file, filename, importNo, results)
  let items: any = []
  try {
    let r = 1
    for (const item of results) {
      r++
      const msg = 'under progress'
      //check that line alloted for comment(if yes then skip this raw data)
      if (item.sku) {
        if (item.sku.trim() == 'skip') continue
      }
      if (item.barcode) {
        if (item.barcode.trim() == 'skip') continue
      }
      const i = {
        importNo: importNo,
        rawNo: r,
        fileName: filename,
        type: 'category',
        message: msg,
        user: userId,
        data: item,
      }
      items.push(i)
    }
    items = await ImportDetail.insertMany(items)
  } catch (e) {
    console.log('error in insert details is:', e.message)
  }

  file.productCount = results.length
  let totalItems = results.length
  let raw = 0
  for (let c of results) {
    //product validation for data
    c = testCategory(c)
    try {
      const category: any = {} // Never add anything extra here. It will erase that field (e.g. features)
      // if (!ObjectId.isValid(c._id) || !checkForHexRegExp.test(c._id))
      //   return
      // console.log('current category is: ', c)
      if (c.category_id == 'skip') {
        totalItems--
        continue
      }
      if (c.id) {
        c._id = c.id
      }
      //lets handle the store now
      if (store) category.store = store._id

      if (c.category) {
        category.name = c.category
      }
      if (c.category_id) {
        category.categoryId = c.category_id
      }
      if (c.img) {
        category.img = c.img.trim()
        if (category.img == 'DELETE') category.img = undefined
        // category.img = s3Uploader.fileUploadFromUrl.bind(s3Uploader)
        // console.log('aa', category.img)
      }
      if (c.active) {
        category.active = JSON.parse(c.active.toLowerCase())
      }
      if (c.level) {
        category.level = c.level
      }
      if (c.position) {
        category.position = c.position
      }
      if (c.megamenu) {
        category.megamenu = JSON.parse(c.megamenu.toLowerCase())
      }
      if (c.featured) {
        category.featured = JSON.parse(c.featured.toLowerCase())
      }

      if (c.shopbycategory) {
        category.shopbycategory = JSON.parse(c.shopbycategory.toLowerCase())
      }

      if (c.sizechart) {
        category.sizechart = c.sizechart
      }
      if (c.brand_id) {
        const found: any = await Brand.findOne({
          brandId: c.brand_id.trim(),
        })
        if (found) category.brand = found._id
      }

      if (c.parent_category_id) {
        const parent = await Category.findOne({
          categoryId: c.parent_category_id,
        }).collation({
          locale: 'tr',
          strength: 2,
        })
        if (!parent) {
          throw new Error(
            'please enter in correct Format, parent not exist for ' +
              category.name
          )
        } else {
          // console.log('parent found', parent)
          category.parent = parent.id
        }
      }
      //if category existing then category will update
      const cate = await Category.findOne({
        $or: [{ _id: c._id }, { categoryId: category.categoryId }],
      }).collation({ locale: 'tr', strength: 1 })
      // console.log('found category is:', cate)
      let found: any = {}
      if (cate) {
        //UPDATE EXISTING CATEGORY
        if (category.img) {
          let data = await fileUploadFromUrlAll({
            url: category.img,
            folder: `stores/${store._id}/category`,
          })
          if (data) {
            if (data.url) category.img = data.url
          }
        }
        found = await Category.findOneAndUpdate(
          { _id: cate.id },
          { $set: { ...category } },
          { new: true }
        )
        // console.log('Updated Category : ', category.id)
        await ImportDetail.findByIdAndUpdate(items[raw].id, {
          $set: {
            message: 'Category already exist, so category updated',
            totalItems: totalItems,
            success: true,
          },
        })
        await saveCategoryArtifacts(found)
        if (category.parent) {
          await categoryPoolInProduct(found)
          await recurseCategory(category) //update children field
        }
      } else {
        //When new category have to create
        found = new Category(category)
        await found.save()
        await ImportDetail.findByIdAndUpdate(items[raw].id, {
          $set: {
            message: 'New Category Created',
            totalItems: totalItems,
            success: true,
          },
        })
        //UPDATE EXISTING CATEGORY
        if (category.img) {
          let data = await fileUploadFromUrlAll({
            url: category.img,
            folder: `stores/${store._id}/category`,
          })
          if (data) {
            if (data.url) found.img = data.url
          }
        }
        await saveCategoryArtifacts(found)
      }

      // console.log('at the end')
    } catch (e) {
      //in case somthing wrong in the category csv import ,it will show that what happened with each raw data
      // console.log('error in import category ', e.message,e)
      await ImportDetail.findByIdAndUpdate(items[raw].id, {
        $set: {
          message: e.message,
          totalItems: totalItems,
          success: false,
        },
      })
    }
    raw += 1
  }
}

const testCategory = (c: any) => {
  const category = { ...c }
  for (const a in category) {
    if (category[a].includes('undefined' || 'null')) {
      delete category[a]
    }
    if (category[a] == undefined || null) {
      delete category[a]
    }
  }
  return category
}
