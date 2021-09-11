import { Store } from '../models'

export const mustStoreAggBuilder = (
  store: string,
  s: string,
  predicate: string
) => {
  let arrayOfWords = []
  const searchWords = []
  const must: any = [
    {
      term: {
        featured: true,
      },
    },
  ]
  if (s) {
    must.push({
      multi_match: {
        query: s,
        fields: ['name'],
      },
    })
  }
  return must
}
export const mustStoreBuilder = (store: string, s: string) => {
  const must: any = [
    {
      term: {
        featured: true,
      },
    },
  ]
  if (s) {
    must.push({
      multi_match: {
        query: s,
        fields: ['name'],
      },
    })
  }
  return must
}

export const mustAggBuilder = (
  store: string,
  s: string,
  categories: string,
  brands: string,
  parentBrands: string,
  genders: string,
  sizes: string,
  colors: string,
  price: string,
  age: string,
  discount: string,
  predicate: string
) => {
  let arrayOfWords = []
  const searchWords = []
  const must: any = []
  if (s) {
    must.push({
      // query_string: {
      //   query: `*${s}*`,
      multi_match: {
        query: s,
        fields: [
          'name',
          'sku',
          'keyFeatures',
          'description',
          'keywords',
          'brand.name',
          'parentBrand.slug',
          'color.name',
          'categoryPool.slug',
          'gender',
          'size.name',
          'manufacturer',
          'countryOfOrigin',
        ],
      },
    })
  }
  // if (store.length > 0 && predicate != 'store')
  //   must.push({
  //     terms: {
  //       'store.keyword': store,
  //     },
  //   })
  if (categories.length > 0 && predicate != 'categories')
    must.push({
      terms: {
        'categoryPool.slug.keyword': categories.toLowerCase().split(','),
      },
    })
  if (brands.length > 0 && predicate != 'brands')
    must.push({
      terms: {
        'brand.name.keyword': brands.split(','),
      },
    })
  if (parentBrands.length > 0 && predicate != 'parentBrands')
    must.push({
      terms: {
        'parentBrand.slug.keyword': parentBrands.toLowerCase().split(','),
      },
    })
  if (genders.length > 0 && predicate != 'genders')
    must.push({
      terms: {
        'gender.keyword': genders.split(','),
      },
    })
  if (sizes.length > 0 && predicate != 'sizes')
    must.push({
      terms: {
        'size.name.keyword': sizes.split(','),
      },
    })
  if (colors.length > 0 && predicate != 'colors')
    must.push({
      terms: {
        'color.name.keyword': colors.split(','),
      },
    })
  if (age.length > 0 && predicate != 'age') {
    must.push({
      range: {
        ageMin: {
          gte: +age.split(',')[0],
          lte: +age.split(',')[1],
        },
      },
    })
  }
  if (discount.length > 0 && predicate != 'discount') {
    must.push({
      range: {
        discount: {
          gte: +discount.split(',')[0],
          lte: +discount.split(',')[1],
        },
      },
    })
  }
  if (price.length > 0 && predicate != 'price') {
    must.push({
      range: {
        price: {
          gte: +price.split(',')[0],
          lte: +price.split(',')[1],
        },
      },
    })
  } else {
    must.push({
      range: {
        price: {
          gt: 0,
        },
      },
    })
  }
  must.push({
    range: {
      stock: {
        gt: 0,
      },
    },
  })
  if (store) {
    must.push({
      term: {
        'store.keyword': store,
      },
    })
  }
  // if (colors.length > 0 && predicate != 'colors')
  // must.push({
  //   nested: {
  //     path: 'color',
  //     query: {
  //       bool: {
  //         should: [
  //           {
  //             bool: {
  //               must: [
  //                 {
  //                   terms: {
  //                     'color.name.raw': colors.split(','),
  //                   },
  //                 },
  //               ],
  //             },
  //           },
  //         ],
  //       },
  //     },
  //   },
  // })

  return must
}
export const mustBuilder = (
  store: string,
  s: string,
  categories: string,
  brands: string,
  parentBrands: string,
  genders: string,
  sizes: string,
  colors: string,
  price: string,
  age: string,
  discount: string
) => {
  const must: any = []
  if (s) {
    must.push({
      // query_string: {
      //   query: `*${s}*`,
      multi_match: {
        query: s,
        fields: [
          'name',
          'sku',
          'keyFeatures',
          'description',
          'keywords',
          'brand.name',
          'parentBrand.slug',
          'color.name',
          'categoryPool.slug',
          'gender',
          'size.name',
          'manufacturer',
          'countryOfOrigin',
        ],
      },
    })
  }
  if (store)
    must.push({
      term: {
        'store.keyword': store,
      },
    })
  if (categories.length > 0)
    must.push({
      terms: {
        'categoryPool.slug.keyword': categories.split(','),
      },
    })
  if (brands.length > 0)
    must.push({
      terms: {
        'brand.name.keyword': brands.split(','),
      },
    })
  if (parentBrands.length > 0)
    must.push({
      terms: {
        'parentBrand.slug.keyword': parentBrands.toLowerCase().split(','),
      },
    })
  if (genders.length > 0)
    must.push({
      terms: {
        'gender.keyword': genders.split(','),
      },
    })
  if (colors.length > 0)
    must.push({
      terms: {
        'color.name.keyword': colors.split(','),
      },
    })
  if (sizes.length > 0)
    must.push({
      terms: {
        'size.name.keyword': sizes.split(','),
      },
    })

  if (age.length > 0) {
    must.push({
      range: {
        ageMin: {
          gte: +age.split(',')[0],
          lte: +age.split(',')[1],
        },
      },
    })
  }
  if (discount.length > 0) {
    must.push({
      range: {
        discount: {
          gte: +discount.split(',')[0],
          lte: +discount.split(',')[1],
        },
      },
    })
  }
  if (price.length > 0) {
    must.push({
      range: {
        price: {
          gte: +price.split(',')[0],
          lte: +price.split(',')[1],
        },
      },
    })
  } else {
    must.push({
      range: {
        price: {
          gt: -1,
        },
      },
    })
  }
  must.push({
    range: {
      stock: {
        gt: 0,
      },
    },
  })
  // if (colors.length > 0)
  //   must.push({
  //     nested: {
  //       path: 'color',
  //       query: {
  //         bool: {
  //           should: [
  //             {
  //               bool: {
  //                 must: [
  //                   {
  //                     terms: {
  //                       'color.name.raw': colors.split(','),
  //                     },
  //                   },
  //                 ],
  //               },
  //             },
  //           ],
  //         },
  //       },
  //     },
  //   })
  return must
}
