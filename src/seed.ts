import addressInput from './migrations/addresses'
import bannersInput from './migrations/banners'
import brandsInput from './migrations/brands'
import categoriesInput from './migrations/categories'
import citiesInput from './migrations/cities'
import countriesInput from './migrations/countries'
import couponsInput from './migrations/coupons'
import ordersInput from './migrations/orders'
import pagesInput from './migrations/pages'
import payInput from './migrations/paymentmethods'
import productsInput from './migrations/products'
import rolesInput from './migrations/roles'
import settingsInput from './migrations/settings'
import subscriptionsInput from './migrations/subscription'
import unitsInput from './migrations/units'
import usersInput from './migrations/users'
import usersMandateInput from './migrations/usersMandate'
import {
  Address,
  Banner,
  Brand,
  Category,
  City,
  Country,
  Coupon,
  Media,
  Order,
  Page,
  PaymentMethod,
  Product,
  Role,
  Setting,
  Subscription,
  Unit,
  User,
} from './models'

export const seedMandatory = async () => {
  // Setting
  try {
    const count = await Setting.countDocuments()
    if (count < 1) {
      const s = new Setting(settingsInput)
      await s.save()
      const data = await Setting.find()
      data.forEach((data) => {
        data.save()
      })
      console.log('finished populating settings')
    }
  } catch (e) {
    console.log('Error populating settings... ', e)
  }
  // Payment Methods
  try {
    const count = await PaymentMethod.countDocuments()
    if (count < 1) {
      // @ts-ignore
      await PaymentMethod.create(payInput)
      const data = await PaymentMethod.find()
      data.forEach((data) => {
        data.save()
      })
      console.log('finished populating payment methods')
    }
  } catch (e) {
    console.log('Error populating payment methods... ', e)
  }
  // Roles
  try {
    const count = await Role.countDocuments()
    if (count < 1) {
      // @ts-ignore
      await Role.create(rolesInput)
      const data = await Role.find()
      data.forEach((data) => {
        data.save()
      })
      console.log('finished populating roles')
    }
  } catch (e) {
    console.log('Error populating roles... ', e)
  }
  // Users
  try {
    const count = await User.countDocuments()
    if (count < 1) {
      // @ts-ignore
      await User.create(usersMandateInput)
      const data = await User.find()
      data.forEach((data) => {
        data.save()
      })
      console.log('finished populating users mandate')
    }
  } catch (e) {
    console.log('Error populating users mandate... ', e)
  }
  // Units
  try {
    const count = await Unit.countDocuments()
    if (count < 1) {
      // @ts-ignore
      await Unit.create(unitsInput)
      const data = await Unit.find()
      data.forEach((data) => {
        data.save()
      })
      console.log('finished populating unit')
    }
  } catch (e) {
    console.log('Error populating units... ', e)
  }
  // Countries
  try {
    const count = await Country.countDocuments()
    if (count < 1) {
      await Country.create(countriesInput)
      const data = await Country.find()
      data.forEach((data) => {
        data.save()
      })
      console.log('finished populating countries')
    }
  } catch (e) {
    console.log('Error populating countries... ', e)
  }
  // Subscriptions
  try {
    const count = await Subscription.countDocuments()
    if (count < 1) {
      await Subscription.create(subscriptionsInput)
      const data = await Subscription.find()
      data.forEach((data) => {
        data.save()
      })
      console.log('finished populating subscriptions')
    }
  } catch (e) {
    console.log('Error populating subscriptions... ', e)
  }
}
export const seed = async () => {
  // Setting
  try {
    const count = await Setting.countDocuments()
    if (count < 1) {
      const s = new Setting(settingsInput)
      await s.save()
      // await Setting.create(settingsInput)
      const data = await Setting.find()
      data.forEach((data) => {
        data.save()
      })
      console.log('finished populating settings')
    }
  } catch (e) {
    console.log('Error populating settings... ', e)
  }
  // Users
  try {
    const count = await User.countDocuments()
    if (count < 1) {
      // const u = new User(usersInput)
      // await u.save()
      // @ts-ignore
      await User.create(usersInput)
      const data = await User.find()
      data.forEach((data) => {
        data.save()
      })
      console.log('finished populating users')
    }
  } catch (e) {
    console.log('Error populating users... ', e)
  }
  // Cities
  try {
    const count = await City.countDocuments()
    if (count < 1) {
      // @ts-ignore
      await City.create(citiesInput)
      const data = await City.find()
      data.forEach((data) => {
        data.save()
      })
      console.log('finished populating cities')
    }
  } catch (e) {
    console.log('Error populating cities... ', e)
  }
  // Addresses
  // try {
  //   const count = await Address.countDocuments()
  //   if (count < 1) {
  //     await Address.create(addressInput)
  //     const data = await Address.find()
  //     data.forEach((data) => {
  //       data.save()
  //     })
  //     console.log('finished populating addresses')
  //   }
  // } catch (e) {
  //   console.log('Error populating addresses... ', e)
  // }
  // Coupons
  try {
    const count = await Coupon.countDocuments()
    if (count < 1) {
      // const p = new Coupon(couponsInput)
      // await p.save()
      // @ts-ignore
      await Coupon.create(couponsInput)
      const data = await Coupon.find()
      data.forEach((data) => {
        data.save()
      })
      console.log('finished populating coupons')
    }
  } catch (e) {
    console.log('Error populating coupons... ', e)
  }
  // Pages
  try {
    const count = await Page.countDocuments()
    if (count < 1) {
      // const p = new Page(pagesInput)
      // await p.save()
      // @ts-ignore
      await Page.create(pagesInput)
      const data = await Page.find()
      data.forEach((data) => {
        data.save()
      })
      console.log('finished populating pages')
    }
  } catch (e) {
    console.log('Error populating pages... ', e)
  }
  // Orders
  // try {
  //   const count = await Order.countDocuments()
  //   if (count < 1) {
  //     await Order.create(ordersInput)
  //     const data = await Order.find()
  //     data.forEach((data) => {
  //       data.save()
  //     })
  //     console.log('finished populating orders')
  //   }
  // } catch (e) {
  //   console.log('Error populating orders... ', e)
  // }
  // Media
  try {
    const count = await Banner.countDocuments()
    if (count < 1) {
      await Banner.create(bannersInput)
      const data = await Banner.find()
      data.forEach((data) => {
        data.save()
      })
      console.log('finished populating banners')
    }
  } catch (e) {
    console.log('Error populating banners... ', e)
  }
  // Products
  try {
    const count = await Product.countDocuments()
    if (count < 1) {
      // const p = new Product(productsInput)
      // await p.save()
      // @ts-ignore
      await Product.create(productsInput)
      const data = await Product.find()
      data.forEach((data) => {
        data.save()
      })
      console.log('finished populating products')
    }
  } catch (e) {
    console.log('Error populating products... ', e)
  }
  // Categories
  try {
    const count = await Category.countDocuments()
    if (count < 1) {
      // const c = new Category(categoriesInput)
      // await c.save()
      // @ts-ignore
      await Category.create(categoriesInput)
      const data = await Category.find()
      data.forEach((data) => {
        data.save()
      })
      console.log('finished populating categories')
    }
  } catch (e) {
    console.log('Error populating categories... ', e)
  }
  // Brands
  try {
    const count = await Brand.countDocuments()
    if (count < 1) {
      // @ts-ignore
      await Brand.create(brandsInput)
      const data = await Brand.find()
      data.forEach((data) => {
        data.save()
      })
      console.log('finished populating brands')
    }
  } catch (e) {
    console.log('Error populating brands... ', e)
  }
}
