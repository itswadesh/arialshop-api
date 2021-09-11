exports.subtract = function (ex1: number, ex2: number) {
  return ex1 - ex2
}
exports.multiply = function (ex1: number, ex2: number) {
  return ex1 * ex2
}
exports.json = function (msg: any) {
  return JSON.stringify(msg)
}
exports.date = function (date: Date) {
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]

  const day = date.getDate()
  const monthIndex = date.getMonth()
  const year = date.getFullYear()

  return day + ' ' + monthNames[monthIndex] + ' ' + year
}
