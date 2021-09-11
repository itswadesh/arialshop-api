import {
  IResolvers,
  UserInputError,
  ForbiddenError,
  withFilter,
} from 'apollo-server-express'
import { Request, UserDocument, CartDocument } from '../../types'
import {
  Attribute,
  Brand,
  Category,
  Color,
  Feature,
  ImportDetail,
  Product,
  Setting,
  Size,
  Store,
  User,
} from '../../models'
import {
  dedupeIDs,
  setImgFromImages,
  setCategoryFromCategories,
  fileUploadFromUrlAll,
  syncProductAutocompletion,
  refreshCategoryPool,
  generateSlug,
  saveCategoryArtifacts,
} from '../'
import { DOMAIN_NAME } from '../../config'

const checkCount = (data: any) => {
  try {
    if (data.length > 2000) {
      throw new UserInputError(
        'Only 2000 products allowed for import at a time.'
      )
    }
  } catch (e) {
    throw new Error(e)
  }
}

export const importProducts = async (
  req: Request,
  { file, filename, importNo, results }: any
) => {
  const { userId } = req.session
  const user = await User.findById(userId)
  if (!user || !user.store) throw new Error('you have not own a store')
  const settings = await Setting.findOne({}).exec()
  if (!settings) return
  //store
  const store = await Store.findById(user.store)
  if (!store) throw new Error('You have not own a store')

  // console.log('provided data is: ', userId, file, filename, importNo, results)
  let items: any = []
  // try {
  //   checkCount(results)
  // } catch {
  //   throw new Error('pppppppppppp')
  // }
  try {
    //check product is not more than 2000

    let r = 1
    for (const item of results) {
      r++
      let msg = 'under progress'
      //check that line alloted for comment(if yes then skip this raw data)
      if (item.sku) {
        if (item.sku.trim() == 'skip') continue
      }
      if (item.barcode) {
        if (item.barcode.trim() == 'skip') continue
      }
      if (!item.sku && !item.barcode) {
        msg = 'barcode or sku not provide.'
      }

      const i = {
        importNo: importNo,
        rawNo: r,
        fileName: filename,
        type: 'product',
        message: msg,
        user: userId,
        data: item,
      }
      item.rawNo = r
      items.push(i)
    }
    items = await ImportDetail.insertMany(items)
  } catch (e) {
    console.log('error in insert details is:', e.message)
    return
  }

  file.productCount = results.length
  let totalItems = results.length
  const importedProducts: any = []
  for (let p of results) {
    //product validation for data
    try {
      p = testImportProduct(p)
      const product: any = {} // Never add anything extra here. It will erase that field (e.g. features)
      // if (!ObjectId.isValid(p._id) || !checkForHexRegExp.test(p._id))
      //   return
      // console.log('current product sku and barcode are: ', p.sku, p.barcode)
      product.vendor = userId
      if (!p.sku && !p.barcode) {
        continue
      }
      //check that line alloted for comment(if yes then skip this raw data)
      if (p.sku) {
        if (p.sku.trim() == 'skip') {
          totalItems--
          continue
        }
      }
      if (p.barcode) {
        if (p.barcode.trim() == 'skip') {
          totalItems--
          continue
        }
      }
      if (p.id) {
        p._id = p.id.trim()
      }
      if (p._id) {
        const id = p._id.trim()
      }
      if (p.name) {
        product.name = p.name.trim()
      }
      if (p.hsn) {
        product.hsn = p.hsn.trim()
        if (product.hsn == 'DELETE') product.hsn = undefined
      }
      //old approach for specification provide as specs
      // if (p.specs) {
      //   const str = p.specs.split('\n\n')
      //   const a = str.map((s: any) => {
      //     const b = s && s.trim('').split('\n')
      //     if (b[0] == 'SKU') p.sku = b[1]
      //     if (b[0] == 'Color') p.color = b[1]
      //     if (b[0] == 'Brand') p.brand = b[1]
      //     if (b[0] == 'Assorted') p.assorted = b[1]
      //   })
      //   // console.log('specifiction is:', a)
      // }
      if (p.slug) {
        product.slug = p.slug.trim()
      }
      if (p.sku) {
        product.sku = p.sku.trim()
      }
      if (p.barcode) {
        const regex = /^[A-Za-z0-9]+$/
        if (!regex.test(p.barcode)) {
          throw new UserInputError('Barcode format is incorrect')
        }
        product.barcode = p.barcode.trim()
      }
      if (p.hsn) {
        const regex = /^[A-Za-z0-9]+$/
        if (!regex.test(p.hsn)) {
          throw new UserInputError('hsn format is incorrect')
        }
        product.hsn = p.hsn.trim()
      }
      //lets handle the store now
      if (store) product.store = store._id

      if (p.description) {
        product.description = p.description.trim()
        if (product.description == 'DELETE') product.description = undefined
      }
      if (p.type) {
        product.type = p.type.trim()
        if (product.type == 'DELETE') product.type = 'physical'
      }
      if (p.stock) {
        product.stock = p.stock.trim()
        if (product.stock == 'DELETE') product.stock = 0
      }
      if (p.price) {
        const price = p.price.trim()
        product.price = price.replace(/[^\d.-]/g, '')
        if (product.price == 'DELETE') product.price = 0
        // product.price = parseFloat(price1)
        // console.log('a', price, product.price)
      }
      if (p.assorted) {
        product.assorted = p.assorted.trim()
        if (product.assorted == 'DELETE') product.assorted = undefined
      }
      if (p.time) {
        product.time = p.time.trim()
        if (product.time == 'DELETE') product.time = undefined
      }
      if (p.metaTitle) {
        product.title = p.metaTitle.trim()
        if (product.title == 'DELETE') product.title = undefined
      }
      if (p.metaDescription) {
        product.metaDescription = p.metaDescription.trim()
        if (product.metaDescription == 'DELETE')
          product.metaDescription = undefined
      }
      if (p.metaKeywords) {
        product.metaKeywords = p.metaKeywords.trim()
        if (product.metaKeywords == 'DELETE') product.metaKeywords = undefined
      }
      if (p.link) {
        product.link = p.link.trim()
        if (product.link == 'DELETE') product.link = undefined
      }
      if (p.gender) {
        product.gender = p.gender.trim()
        if (product.gender == 'DELETE') product.gender = undefined
      }
      if (p.createdAt) {
        product.createdAt = p.createdAt.trim()
        if (product.createdAt == 'DELETE') product.createdAt = undefined
      }
      if (p.updatedAt) {
        product.updatedAt = p.updatedAt.trim()
        if (product.updatedAt == 'DELETE') product.updatedAt = undefined
      }
      if (p.mrp) {
        product.mrp = p.mrp.trim()
        if (product.mrp == 'DELETE') product.mrp = 0
      }
      if (p.condition) {
        product.condition = p.condition.trim()
        if (product.condition == 'DELETE') product.condition = undefined
      }
      if (p.gtin) {
        product.gtin = p.gtin.trim()
        if (product.gtin == 'DELETE') product.gtin = undefined
      }
      if (p.tax) {
        product.tax = p.tax.trim()
        if (product.tax == 'DELETE') product.tax = 0
      }
      if (p.age_min) {
        product.ageMin = p.age_min.trim()
        if (product.ageMin == 'DELETE') product.ageMin = undefined
      }
      if (p.age_max) {
        product.ageMax = p.age_max.trim()
        if (product.ageMax == 'DELETE') product.ageMax = undefined
      }
      if (p.age_unit) {
        product.ageUnit = p.age_unit.trim().toLowerCase()
        if (product.ageUnit == 'DELETE') product.ageUnit = undefined
      }
      if (p.availability) {
        product.availability = p.availability.trim()
        if (product.availability == 'DELETE') product.availability = undefined
      }
      if (p.warranty) {
        product.warranty = p.warranty.trim()
        if (product.warranty == 'DELETE') product.warranty = undefined
      }
      if (p.item_id) {
        product.itemId = p.item_id.trim()
        if (product.itemId == 'DELETE') product.itemId = undefined
      }
      if (p.style_code) {
        product.styleCode = p.style_code.trim()
        if (product.styleCode == 'DELETE') product.styleCode = undefined
      }
      if (p.ean_no) {
        product.eanNo = p.ean_no.trim()
        if (product.eanNo == 'DELETE') product.eanNo = undefined
      }
      if (p.article_code) {
        product.articleCode = p.article_code.trim()
        if (product.articleCode == 'DELETE') product.articleCode = undefined
      }
      if (p.product_master_id) {
        product.productMasterId = p.product_master_id.trim()
        if (product.productMasterId == 'DELETE')
          product.productMasterId = undefined
      }
      if (p.currency) {
        product.currency = p.currency.trim()
        if (product.currency == 'DELETE') product.currency = undefined
      }
      if (p.manufacturer) {
        product.manufacturer = p.manufacturer.trim()
        if (product.manufacturer == 'DELETE') product.manufacturer = undefined
      }
      if (p.sizechart) {
        product.sizechart = p.sizechart.trim()
        if (product.sizechart == 'DELETE') product.sizechart = undefined
      }
      if (p.batch_no) {
        product.batch_no = p.batch_no.trim()
        if (product.batch_no == 'DELETE') product.batch_no = undefined
      }
      if (p.mfg_date) {
        product.mfg_date = p.mfg_date.trim()
        if (product.mfg_date == 'DELETE') product.mfg_date = undefined
      }
      if (p.expiry_date) {
        product.expiry_date = p.expiry_date.trim()
        if (product.expiry_date == 'DELETE') product.expiry_date = undefined
      }
      if (p.return_info) {
        product.returnInfo = p.return_info.trim()
        if (product.returnInfo == 'DELETE') product.returnInfo = undefined
      }
      if (p.replace_allowed) {
        product.replaceAllowed = JSON.parse(p.replace_allowed.toLowerCase())
        if (product.replaceAllowed == 'DELETE')
          product.replaceAllowed = undefined
      }
      if (p.return_allowed) {
        product.returnAllowed = JSON.parse(p.return_allowed.toLowerCase())
        if (product.returnAllowed == 'DELETE') product.returnAllowed = undefined
      }
      if (p.return_validity_in_days) {
        product.returnValidityInDays = p.return_validity_in_days.trim()
        if (product.returnValidityInDays == 'DELETE')
          product.returnValidityInDays = undefined
      } else {
        if (product.returnInfo) {
          product.returnValidityInDays =
            parseInt(product.returnInfo.replace(/[^\d\.]*/g, '')) || 0
          product.returnAllowed = true
        }
      }
      if (p.country_of_origin) {
        product.countryOfOrigin = p.country_of_origin.trim()
        if (product.countryOfOrigin == 'DELETE')
          product.countryOfOrigin = undefined
      }
      if (p.keywords) {
        product.keywords = p.keywords.trim()
        if (product.keywords == 'DELETE') product.keywords = undefined
      }
      if (p.key_features) {
        const keyFeatures = p.key_features.trim()
        if (keyFeatures.includes('|')) {
          product.keyFeatures = keyFeatures.split('|')
        } else {
          if (
            keyFeatures != '' ||
            keyFeatures != 'null' ||
            keyFeatures != 'undefined' ||
            keyFeatures != 'DELETE'
          )
            product.keyFeatures = [keyFeatures]
        }
        if (keyFeatures == 'DELETE') product.keyFeatures = []
      }
      //upload img file in the azure db
      if (p.img) {
        if (p.img == 'DELETE') {
          product.img = undefined
        } else {
          product.img = p.img.trim()
        }
      }
      if (p.images) {
        // product.images = eval(p.images)
        const mystring = p.images.trim()
        // Used this regular expression to match square brackets or single quotes:
        const b = mystring.replace(/[\[\] ']+/g, '')
        if (b == 'DELETE') product.images = []
        else {
          if (b.includes(',')) product.images = b.trim().split(',')
          else {
            product.images = [b]
          }
        }
      }
      //look for existing size(via: name) if not found then create one and use that
      let newSize: any
      if (p.size) {
        if (p.size.trim() == 'DELETE') product.size = undefined
        else {
          // console.log('Finding Size : ', p._id, ' ', p.Size)
          newSize = await Size.findOne({
            name: p.size.trim(),
          }).collation({
            locale: 'tr',
            strength: 2,
          })
          if (!newSize) {
            // console.log('Size not found', Size)
            newSize = new Size({
              name: p.size.trim(),
            })
            await newSize.save()
          }
          // console.log('Size found', Size)
          if (newSize) product.size = newSize.id
        }
      }
      //look for color(via: color_code(reason:unique)) in existing DB ,if not found then create it and use that
      let newColor: any
      if (p.color_code) {
        if (p.color_code.trim() == 'DELETE') product.color_code = undefined
        else {
          // console.log('Finding Color : ', p._id, ' ', p.color)
          newColor = await Color.findOne({
            color_code: p.color_code.trim(),
          }).collation({
            locale: 'tr',
            strength: 2,
          })

          if (!newColor) {
            // console.log('color not found', color)
            if (p.color) {
              newColor = new Color({
                name: p.color.trim(),
                color_code: p.color_code.trim(),
              })
              await newColor.save()
              // product.color = newColor.id
            }
            // } else {
            // console.log('color found', color)
          }
          if (newColor) product.color = newColor.id
        }
      }
      // console.log(newColor,newSize)
      // look for vendor(via phone and email) in DB if not exist than create vendor and use its id
      if (settings.isMultiVendor) {
        p.vendor_phone = p.vendor_phone && p.vendor_phone.trim()
        p.vendor_email = p.vendor_email && p.vendor_email.trim()
        p.vendor_name = p.vendor_name && p.vendor_name.trim()
        if (
          p.vendor_phone ||
          p.vendor_email ||
          p.vendor_email != '' ||
          p.vendor_phone != ''
        ) {
          if (
            p.vendor_phone == 'DELETE' ||
            p.vendor_email == 'DELETE' ||
            p.vendor_name == 'DELETE'
          )
            throw new Error('vendor not provided')
          let vendorPhone
          let vendorEmail
          let vendorName
          if (p.vendor_phone) vendorPhone = p.vendor_phone.trim()
          if (p.vendor_email) vendorEmail = p.vendor_email.trim()
          if (p.vendor_name) vendorName = p.vendor_name.trim()

          let vendor: any
          //check if vendor Email provide
          if (vendorEmail) {
            vendor = await User.findOne({
              email: vendorEmail,
            }).collation({
              locale: 'tr',
              strength: 2,
            })
          }
          if (!vendor) {
            if (vendorPhone) {
              vendor = await User.findOne({ phone: vendorPhone })
            }
          }
          if (!vendor) {
            // console.log('vendor not found so create new one')
            const newVendor = new User({
              phone: vendorPhone,
              email: vendorEmail,
              firstName: vendorName,
              role: 'vendor',
              password: 'litekart',
            })
            await newVendor.save()
            product.vendor = newVendor.id
          } else {
            // console.log('vendor found', vendor.id, vendor.firstName)
            product.vendor = vendor.id
          }
        } else {
          product.vendor = userId
        }
      }

      //Old approach for category search and create category FORMAT(cat1> cate2 >cate3 > approach) via name
      if (p.category) {
        const cate = p.category.trim()
        if (cate == 'DELETE') product.category = undefined
        else {
          const c = cate.replace(/ > /g, '/') //REplace space with
          const cateTreeList = c.split('/')
          let currentParent: any // this is used when create category
          let currentCategory: any
          console.log('Before category loop..........', cateTreeList)
          for (const i of cateTreeList) {
            // console.log('Inside category loop..........', i)
            const found = await Category.findOne({
              name: i,
              parent: currentParent,
            }).collation({
              locale: 'tr',
              strength: 2,
            })
            if (found) {
              // console.log('we found the category', found)
              currentParent = found.id
              currentCategory = found
            } else {
              // console.log('category not found so create the category:', i)
              const args: any = {}
              args.name = i
              args.user = userId
              if (currentParent) args.parent = currentParent
              const newCategory = await Category.create(args) //create new categ with args
              // console.log('category created: ', i)
              if (newCategory) {
                currentParent = newCategory._id
                currentCategory = newCategory
                await saveCategoryArtifacts(newCategory) //For slug and other things
              }
            }
          }
          product.category = currentCategory.id
        }
      }

      //look for brand (via: brandId (not a objectID)) in DB if not exist then create it and use it(work for brand and its parents)
      if (p.brand_id && p.brand) {
        if (p.brand.trim() == 'DELETE' || p.brand_id.trim() == 'DELETE')
          product.brand = undefined
        else {
          const brand = await Brand.findOne({
            brandId: p.brand_id.trim(),
          }).collation({
            locale: 'tr',
            strength: 2,
          })
          if (brand) {
            product.brand = brand.id
          } else {
            let parentBrand: any
            let currentBrand: any
            //if parent exist
            if (p.parent_brand_id && p.parent_brand) {
              if (
                p.parent_brand.trim() != 'DELETE' ||
                p.parent_brand_id.trim() != 'DELETE'
              ) {
                parentBrand = await Brand.findOne({
                  brandId: p.parent_brand_id.trim(),
                }).collation({
                  locale: 'tr',
                  strength: 2,
                })
                if (!parentBrand) {
                  const parentData: any = {}
                  parentData.name = p.parent_brand.trim()
                  parentData.brandId = p.parent_brand_id.trim()
                  parentData.user = userId
                  parentBrand = await Brand.create(parentData)
                }
              }
            }
            //now we have parent brand
            const brandData: any = {}
            brandData.name = p.brand.trim()
            brandData.brandId = p.brand_id.trim()
            brandData.user = userId
            if (parentBrand) brandData.parent = parentBrand.id
            const newBrand = await Brand.create(brandData)
            product.brand = newBrand.id
          }
        }
      } else {
        throw new UserInputError('brand or brand_id not provided')
      }
      //if parent exist
      if (p.parent_brand_id && p.parent_brand) {
        if (
          p.parent_brand.trim() == 'DELETE' ||
          p.parent_brand_id.trim() == 'DELETE'
        )
          product.parentBrand = undefined
        else {
          const pBrand = await Brand.findOne({
            brandId: p.parent_brand_id.trim(),
          }).collation({
            locale: 'tr',
            strength: 2,
          })
          let parentBrand: any
          if (pBrand) {
            product.parentBrand = pBrand.id
            parentBrand = pBrand
          } else {
            const parentData: any = {}
            parentData.name = p.parent_brand.trim()
            parentData.brandId = p.parent_brand_id.trim()
            parentData.user = userId
            const newParentBrand = await Brand.create(parentData)
            product.parentBrand = newParentBrand.id
            parentBrand = newParentBrand
          }
          //vendor operation
          if (!settings.isMultiVendor) {
            if (parentBrand) {
              if (parentBrand.slug) {
                const vEmail = `${parentBrand.slug.trim()}@${DOMAIN_NAME}`
                let vendor = await User.findOne({ email: vEmail }).collation({
                  locale: 'tr',
                  strength: 2,
                })
                if (!vendor) {
                  // console.log('vendor not found so create new one')
                  let newVendor = new User({
                    email: vEmail,
                    firstName: parentBrand.slug.trim(),
                    role: 'vendor',
                    password: 'litekart',
                  })
                  newVendor = await newVendor.save()
                  product.vendor = newVendor._id
                } else {
                  product.vendor = vendor._id
                }
              }
            }
          }
        }
      } else {
        throw new UserInputError('parent_brand or parent_brand_id not provided')
      }

      //new apporch for category with id
      //category tree create or update based in provide category_name and category_id(not objectID) ,provide seprate field for these
      const categoryList = []
      if (p.category_id1 && p.category_name1) {
        const obj = {
          categoryId: p.category_id1.trim(),
          category_name: p.category_name1.trim(),
        }
        categoryList.push(obj)
        if (p.category_id2 && p.category_name2) {
          const obj = {
            categoryId: p.category_id2.trim(),
            category_name: p.category_name2.trim(),
          }
          categoryList.push(obj)
          if (p.category_id3 && p.category_name3) {
            const obj = {
              categoryId: p.category_id3.trim(),
              category_name: p.category_name3.trim(),
            }
            categoryList.push(obj)
            if (p.category_id4 && p.category_name4) {
              const obj = {
                categoryId: p.category_id4.trim(),
                category_name: p.category_name4.trim(),
              }
              categoryList.push(obj)
              if (p.category_id5 && p.category_name5) {
                const obj = {
                  categoryId: p.category_id5.trim(),
                  category_name: p.category_name5.trim(),
                }
                categoryList.push(obj)
              }
            }
          }
        }
        let currentParent: any // this is used when create category
        let currentCategory: any
        // console.log('Before category loop..........', categoryList)
        for (const i of categoryList) {
          // console.log('Inside category loop..........', i)
          const found = await Category.findOne({
            categoryId: i.categoryId,
          }).collation({
            locale: 'tr',
            strength: 2,
          })
          if (found) {
            // console.log('we found the category', found)
            currentParent = found.id
            currentCategory = found
          } else {
            // console.log('category not found so create the category:', i)
            const args: any = {}
            args.name = i.category_name
            args.categoryId = i.categoryId
            args.user = userId
            if (currentParent) args.parent = currentParent
            const newCategory = await Category.create(args) //create new categ with args
            // console.log('category created: ', i)
            if (newCategory) {
              currentParent = newCategory._id
              currentCategory = newCategory
              await saveCategoryArtifacts(newCategory) //For slug and other things
            }
          }
        }
        product.category = currentCategory.id
      }
      //in case product have multiple categories then(it will not create new category) only existing category will be added in the product
      if (p.categories) {
        if (p.categories.includes('|')) {
          const cate = p.categories.split('|')
          const cateList: any = []
          for (let category of cate) {
            category = category.trim()
            const found: any = await Category.findOne({
              categoryId: category,
            })
            if (found) cateList.push(found._id)
          }
          product.categories = dedupeIDs(cateList)
        }
        if (p.categories.trim() == 'DELETE') product.categories = []
      }

      //these are used for duplicate reason (in case value not exist), make sure find function not give the not existed field data
      if (!p.sku) {
        p.sku = 'askjlsakldsankgdlaskj'
      }
      if (!p.barcode) {
        p.barcode = 'askjlsakldsankgdlaskj'
      }
      //if product existing then product will update
      // console.log('product is : ', p._id, p.sku, p.barcode)
      const prod = await Product.findOne({
        $or: [{ _id: p._id }, { sku: p.sku }, { barcode: p.barcode }],
      }).collation({ locale: 'tr', strength: 1 })
      // console.log('found product is:...', prod)
      if (p.sku == 'askjlsakldsankgdlaskj') delete p.sku
      if (p.barcode == 'askjlsakldsankgdlaskj') delete p.barcode
      let newProduct: any
      if (prod) {
        //IF PRODUCT EXIST SO WE WILL UPDATE THE PRODUCT
        //HSN check
        if (settings.country) {
          if (settings.country == 'india') {
            if (!product.hsn || product.hsn == '') {
              if (!prod.hsn)
                throw new UserInputError(
                  'HSN not exist in existing product and also not provided in csv , so this product can not updated '
                )
            }
          }
        }

        //for slug
        if (!product.slug) {
          //slug not provided
          if (newColor && newSize) {
            prod.slug = await generateSlug(
              prod.name + ' ' + newColor.name + ' ' + newSize.name,
              'product',
              prod.slug,
              'string',
              product.store
            )
          }
          if (!newColor && newSize) {
            prod.slug = await generateSlug(
              prod.name + ' ' + newSize.name,
              'product',
              prod.slug,
              'string',
              product.store
            )
          }
          if (newColor && !newSize) {
            prod.slug = await generateSlug(
              prod.name + ' ' + newColor.name,
              'product',
              prod.slug,
              'string',
              product.store
            )
          }
        }
        // console.log('the updated product is:', prod.id)
        newProduct = await Product.findOneAndUpdate(
          { _id: prod.id },
          { $set: product },
          { new: true }
        )
        if (product.productMasterId || product.styleCode)
          newProduct.styleId = undefined
        // console.log('Updated Product : ', prod, newProduct)
        // await setImgFromImages(newProduct)
        //sizechart
        if (newProduct.sizechart) {
          let data = await fileUploadFromUrlAll({
            url: newProduct.sizechart,
            folder: `stores/${store._id}/product/${newProduct._id}/sizechart`,
          })
          if (data) {
            if (data.url) newProduct.sizechart = data.url
          }
        }
        newProduct = await setCategoryFromCategories(newProduct)
        await newProduct.save()
        await refreshCategoryPool(newProduct)
        await featuresImportProduct(newProduct, p, userId)
        // await specificationsImportProduct(newProduct, p, userId)
        if (p.product_specifications) {
          if (p.product_specifications.trim() == 'DELETE') {
            if (newProduct.specifications.length > 0) {
              for (const f of newProduct.specifications) {
                try {
                  await Feature.findByIdAndDelete(f)
                } catch (e) {}
              }
              newProduct.specifications = []
              await newProduct.save()
            }
          } else {
            await syncFeatures(newProduct, p, userId, 'specification')
          }
        }
        if (p.product_details) {
          // console.log('product_details', p.product_details)
          if (p.product_details.trim() == 'DELETE') {
            if (newProduct.productDetails.length > 0) {
              for (const f of newProduct.productDetails) {
                try {
                  await Feature.findByIdAndDelete(f)
                } catch (e) {}
              }
              newProduct.productDetails = []
              await newProduct.save()
            }
          } else {
            await syncFeatures(newProduct, p, userId, 'details')
          }
        }
        //call for model importDetail which is responsible for what happened with product
        await ImportDetail.findOneAndUpdate(
          { rawNo: p.rawNo, importNo },
          {
            $set: {
              message: 'Product already exist, so product updated',
              totalItems: totalItems,
              success: true,
            },
          }
        )
      } else {
        //CREATE NEW PRODUCT
        if (settings.country) {
          if (settings.country == 'india') {
            if (!product.hsn || product.hsn == '') {
              throw new UserInputError('HSN not provided for new product')
            }
          }
        }
        //for slug
        if (!product.slug) {
          //slug not provided
          if (newColor && newSize) {
            product.slug = await generateSlug(
              product.name + ' ' + newColor.name + ' ' + newSize.name,
              'product',
              '',
              'string',
              product.store
            )
          }
          if (!newColor && newSize) {
            product.slug = await generateSlug(
              product.name + ' ' + newSize.name,
              'product',
              '',
              'string',
              product.store
            )
          }
          if (newColor && !newSize) {
            product.slug = await generateSlug(
              product.name + ' ' + newColor.name,
              'product',
              '',
              'string',
              product.store
            )
          }
        }

        newProduct = new Product(product)
        newProduct = await setCategoryFromCategories(newProduct)

        await newProduct.save()
        //sizechart
        if (newProduct.sizechart) {
          let data = await fileUploadFromUrlAll({
            url: newProduct.sizechart,
            folder: `stores/${store._id}/product/${newProduct._id}/sizechart`,
          })
          if (data) {
            if (data.url) newProduct.sizechart = data.url
          }
        }
        // setImgFromImages(newProduct)
        await refreshCategoryPool(newProduct)
        // console.log('Saved Product : ', p._id, ' p: ', p)
        await featuresImportProduct(newProduct, p, userId)
        // await specificationsImportProduct(newProduct, p, userId)
        if (p.product_specifications) {
          if (p.product_specifications.trim() == 'DELETE') {
            newProduct.specifications = []
            newProduct.features = []
          } else {
            await syncFeatures(newProduct, p, userId, 'specification')
          }
        }
        if (p.product_details) {
          if (p.product_details.trim() == 'DELETE')
            newProduct.productDetails = []
          else {
            await syncFeatures(newProduct, p, userId, 'details')
          }
        }
        //call for model importDetail which is responsible for what happened with product
        await ImportDetail.findOneAndUpdate(
          { rawNo: p.rawNo, importNo },
          {
            $set: {
              message: 'New Product Created',
              totalItems: totalItems,
              success: true,
            },
          }
        )
      }
      await syncProductAutocompletion(newProduct)
      importedProducts.push(newProduct)
    } catch (e) {
      //in case somthing wrong in the product csv import ,it will show that what happened with each raw data
      try {
        // console.log('error in import product ', e.message,e)
        await ImportDetail.findOneAndUpdate(
          { rawNo: p.rawNo, importNo },
          {
            $set: {
              message: e.message,
              totalItems: totalItems,
              success: false,
            },
          }
        )
      } catch (e) {
        throw new UserInputError(e)
      }
    }
    // console.log('at the end')
  }
  //now we upload images of the products
  try {
    const uploadPromises = importedProducts.map(async (d: any) => {
      try {
        const images = d.images
        const updatedImages = []
        for (let link of images) {
          const data = await fileUploadFromUrlAll({
            url: link,
            folder: `stores/${store._id}/product/${d._id}`,
          })
          if (data) {
            if (data.url) link = data.url
          }
          if (link != null && link != '') updatedImages.push(link)
        }
        d.images = updatedImages
        d = await setImgFromImages(d)
        await d.save()
        // console.log('Upload success... ')
      } catch (e) {
        console.log('Upload err at lib...', e)
      }
    })
    return Promise.all(uploadPromises)
  } catch (e) {
    throw new UserInputError(e)
  }
}

export const testImportProduct = (p: any) => {
  try {
    const product = { ...p }
    for (let a in product) {
      let value = { ...product[a] }
      if (
        value == 'undefined' ||
        value == 'null' ||
        value == undefined ||
        value == null
      ) {
        delete product[a]
      }
    }
    return product
  } catch (e) {
    throw new UserInputError(e)
  }
}

export const syncFeatures = async (
  newProduct: any, //created or updated product
  p: any,
  userId: string,
  type: string
) => {
  try {
    let featuresString: any
    if (type == 'specification') featuresString = p.product_specifications
    else featuresString = p.product_details
    //now proceed
    let features: any = []
    if (featuresString.includes('|')) {
      features = featuresString.split('|')
    } else {
      features.push(featuresString)
    }
    // console.log('calling for ', type, 'with data', features)
    if (features.length > 0) {
      for (const f of features) {
        //lets handle feature one by one
        let feature, fName, fValue: any
        if (f) feature = f.trim().split('::')
        if (feature) {
          if (feature[0]) fName = feature[0].trim()
          if (feature[1]) fValue = feature[1].trim()
        }
        // console.log('feature is:',type, fName, fValue, newProduct.category )
        if (fName && fValue) {
          // check attributes in category ,then create or update attribute(like if attribute Show is false then make it true)
          if (newProduct.category) {
            const c: any = await Category.findById(newProduct.category)
            if (c) {
              const attr: any = {}
              attr.name = fName
              attr.category = newProduct.category
              attr.show = true
              // console.log('attribute is:', attr)
              const newAttribute = await Attribute.findOneAndUpdate(
                { name: fName, category: newProduct.category },
                { $set: { ...attr, user: userId } },
                { upsert: true, new: true }
              ).collation({
                locale: 'tr',
                strength: 2,
              })
              //update attribute id in category
              c.attributes.push(newAttribute._id)
              c.attributes = dedupeIDs(c.attributes)
              try {
                await c.save()
              } catch (e) {
                // console.log('error', e)
              }
            }
          }
          // check feature exist in current product or not
          const feature: any = await Feature.findOne({
            product: newProduct._id,
            name: fName,
          }).collation({
            locale: 'tr',
            strength: 2,
          })
          //If we found the feature
          if (!feature) {
            // console.log('feature not found',type,'a',fName,'b',fValue,'id', newProduct._id)
            const featureData: any = {}
            featureData.name = fName
            featureData.value = fValue
            featureData.product = String(newProduct._id)
            featureData.user = userId
            featureData.type = type
            const f = new Feature(featureData)
            await f.save()
            //create new feature with args and push the id into specification
            if (type == 'specification') {
              newProduct.specifications.push(f._id)
              newProduct.specifications = dedupeIDs(newProduct.specifications)
              newProduct.features.push(f._id)
              newProduct.features = dedupeIDs(newProduct.features)
            } else {
              newProduct.productDetails.push(f._id)
              newProduct.productDetails = dedupeIDs(newProduct.productDetails)
            }
            await newProduct.save()
          } else {
            // console.log('Feature found............', feature.value, fValue)
            //no need to update product again
            if (feature.value) {
              let value = feature.value.toLowerCase()
              if (value.includes(fValue.toLowerCase()) == false) {
                feature.value = feature.value + ',' + fValue
                feature.user = userId
                await Feature.findByIdAndUpdate(
                  feature.id,
                  { $set: { ...feature } },
                  { upsert: true, new: true }
                )
              }
            }
          }
        }
      }
    }
  } catch (e) {
    throw new UserInputError(e)
  }
}

//old approach like - (features.name1,features.name2)
export const featuresImportProduct = async (
  newProduct: any,
  p: any,
  userId: string
) => {
  try {
    // console.log( 'Saved or updated Product : ', newProduct )
    //This is for product features
    for (const a in p) {
      if (a.includes('features.')) {
        let fName, fValue: any
        if (a) fName = a.trim().split('.')[1]
        if (p[a]) fValue = p[a].trim()
        if (fValue) {
          const attr: any = {}
          attr.name = fName
          attr.category = newProduct.category
          attr.show = true

          //check attributes in category ,then create or update them(like if attribute Show is false htne make it true)
          const newAttribute = await Attribute.findOneAndUpdate(
            { name: fName, category: newProduct.category },
            { $set: { ...attr, user: userId } },
            { upsert: true, new: true }
          ).collation({
            locale: 'tr',
            strength: 2,
          })
          await newAttribute.save() // To fire pre save hoook
          const c: any = await Category.findById(attr.category)
          c.attributes.push(newAttribute._id)
          c.attributes = dedupeIDs(c.attributes)
          await c.save()

          // check feature exist in current product or not
          const feature: any = await Feature.findOne({
            product: newProduct._id,
            name: fName,
          }).collation({
            locale: 'tr',
            strength: 2,
          })
          //If we found the feature
          if (feature) {
            //if feature
            // console.log('after search feature in the product', feature)
            let value = feature.value.toLowerCase()
            if (value.includes(fValue.toLowerCase()) == false) {
              feature.value = feature.value + ',' + fValue
              feature.user = userId
              await Feature.findByIdAndUpdate(
                feature.id,
                { $set: { ...feature } },
                { upsert: true, new: true }
              )
            }
          } else {
            //feature not found so create it in the product
            const newFeature = new Feature({
              name: fName,
              value: fValue,
              product: newProduct.id,
              user: userId,
            })
            await newFeature.save()
            await Product.findByIdAndUpdate(
              newProduct.id,
              {
                $addToSet: { features: newFeature.id },
              },
              { new: true }
            )
          }
        }
      }
    }
  } catch (e) {
    throw new UserInputError(e)
  }
}
