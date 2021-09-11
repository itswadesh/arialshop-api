import { UserInputError } from 'apollo-server-express'
import { Coupon, Setting } from '../../models'
import { CartDocument, CartItemDocument, SettingsDocument } from '../../types'
import { applyDiscount } from '.'

//function used for get total quantity of all items in cart
export const getTotalQty = (items: Array<CartItemDocument>): number => {
  let qty = 0
  if (!items || !items.length) return qty
  items.forEach((item) => {
    qty += item.qty
  })
  return qty
}

//function used to get subtotal = all Items sum of (item*price)
export const getSubTotal = (items: Array<CartItemDocument>): number => {
  let total = 0
  if (!items || !items.length) return total
  for (const item of items) {
    const price = item.price
    const qty = item.qty
    const amount = price * qty
    total += amount
  }
  return Math.round(total)
}

//function used to get total shipping charge of the items
export const getTotalShipping = (items: Array<CartItemDocument>): number => {
  let totalShipping = 0
  if (!items || !items.length) return totalShipping
  for (const item of items) {
    totalShipping = totalShipping + item.shippingCharge
  }
  return Math.round(totalShipping)
}
export const getTotalTax = (items: Array<CartItemDocument>): number => {
  let totalTax = 0
  if (!items || !items.length) return totalTax
  for (const item of items) {
    totalTax = totalTax + item.tax
  }
  return Math.round(totalTax)
}

export const getTotal = async (cart: CartDocument) => {
  if (!cart.items || !cart.items.length) return 0

  const subtotal = (cart.subtotal = await getSubTotal(cart.items))
  let discount = cart.discount || {}
  const code = cart.discount.code
  try {
    const coupon = await Coupon.findOne({ code, active: true }).select(
      'code color type text terms value minimumCartValue amount maxAmount from to'
    )
    if (coupon && coupon && coupon.value) {
      discount = coupon
      discount.amount = await applyDiscount(
        subtotal,
        discount.value,
        discount.minimumCartValue,
        discount.maxAmount,
        discount.type
      )
    } else {
      discount = { amount: 0 }
    }
  } catch (e) {
    discount = { amount: 0 }
  }
  let shipping, tax
  const setting: SettingsDocument | null = await Setting.findOne()
    .select('shipping tax')
    .exec()
  if (!setting) throw new UserInputError(`Invalid settings`)
  // shipping = cart.shipping = setting.shipping
  // tax = setting.tax
  // if (!shipping || !shipping.charge) shipping.charge = 0
  cart.discount = discount
  tax = cart.tax
  const total =
    +subtotal - +discount.amount + +(cart.shipping || {}).charge + tax
  // cart.tax = {
  //   cgst: (total * +tax.cgst) / 100,
  //   sgst: (total * +tax.sgst) / 100,
  //   igst: (total * +tax.igst) / 100,
  // }
  // return (cart.total =
  //   total + total * (+tax.cgst + +tax.sgst + +tax.igst) * 0.01)
  // return (cart.total = total + total * +tax * 0.01)
  return (cart.total = total)
}

//this fujcntion make an array of based on a property
export const groupBy = (objectArray: any, property: any) => {
  if (!objectArray) return {}
  return objectArray.reduce((acc: any, obj: any) => {
    const key = obj[property]
    if (!acc[key]) {
      acc[key] = []
    }
    // Add object to list for given key's value
    acc[key].push(obj)
    return acc
  }, {})
}
