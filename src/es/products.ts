import { Product } from '../models'
import { esQuery } from './../utils/product'
export default async function (req: any, res: any) {
  let q: any,
    obj = {}
  try {
    q = await esQuery(req.query)
    // res.send(q)
    // @ts-ignore
    const data = await Product.esSearch(q)
    if (data) {
      obj = {
        took: data.took,
        count: data.hits.total,
        data: data.hits.hits,
        facets: data.aggregations,
      }
    } else obj = { took: 0, count: 0, data: [] }
    res.send(obj)
  } catch (e) {
    res.send(e)
  }
}
