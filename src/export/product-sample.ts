export default async function (req: any, res: any) {
  res.download('import-samples/products.csv')
}
