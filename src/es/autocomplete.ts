import { Autocomplete } from '../models'
export default async function (req: any, res: any) {
  let obj = {},
    q = {}
  const name = req.query.q
  const store = req.query.store
  try {
    q = {
      size: 0,
      query: {
        bool: {
          should: [
            {
              match: {
                name,
              },
            },
            {
              wildcard: {
                name: `*${name}*`,
              },
            },
            {
              fuzzy: {
                name: name,
              },
            },
          ],
          must: [
            {
              match: {
                storeId: store,
              },
            },
          ],
          minimum_should_match: 1,
        },
      },
      aggs: {
        autocomplete: {
          terms: {
            field: 'name.keyword',
            size: 10,
          },
        },
      },
    }
    // @ts-ignore
    const data = await Autocomplete.esSearch(q)
    if (data) {
      obj = {
        took: data.took,
        data: data.aggregations.autocomplete.buckets,
      }
    } else obj = { took: 0, data: [] }
    res.send(obj)
  } catch (e) {
    res.send(e)
  }
}
