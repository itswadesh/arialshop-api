import { Store } from '../models'
import { esQueryStore } from './../utils/store'
export default async function (req: any, res: any) {
  let q: any,
    obj = {}
  try {
    q = await esQueryStore(req.query)
    // res.send(q)
    // @ts-ignore
    const data = await Store.esSearch(q)
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
