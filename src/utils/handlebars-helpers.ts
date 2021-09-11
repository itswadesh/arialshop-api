const dayjs = require('dayjs')
// @ts-ignore
export const register = function (Handlebars) {
  const helpers = {
    formatCurrency: function (currency: string) {
      return currency.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,')
    },
    formatDate: function (date: Date, format: string) {
      return dayjs(date).format(format)
    },
  }

  if (Handlebars && typeof Handlebars.registerHelper === 'function') {
    for (const prop in helpers) {
      // @ts-ignore
      Handlebars.registerHelper(prop, helpers[prop])
    }
  } else {
    return helpers
  }
}
