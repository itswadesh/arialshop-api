import { gql } from 'apollo-server-express'

export default gql`
  extend type Query {
    variants(page: Int, search: String, limit: Int, sort: String): variantRes
    variant(id: String!): Variant
    productsByIds(ids: [ID!]): [Product]
    getVariant(pid: ID!, options: [NameValIp]): Variant
    uploads: [File]
    productsEsTruncate: Boolean
    productsSync: Boolean
    productEs(query: String): prodEs
    products(
      page: Int
      skip: Int
      limit: Int
      search: String
      city: String
      type: String
      sort: String
      sku: String
      name: String
      vendor: String
      category: String
      brand: String
      parentBrand: String
      store: ID
      active: Boolean
      trending: Boolean
      sale: Boolean
      new: Boolean
      hot: Boolean
      featured: Boolean
      recommended: Boolean
      status: String
      price: String
      where: String
    ): SearchRes
    trending(type: String, store: ID): [OneProduct]
    inactiveProducts: Int @vendor
    myProducts(
      page: Int
      skip: Int
      limit: Int
      search: String
      city: String
      type: String
      sort: String
      sku: String
      name: String
      vendor: String
      category: String
      brand: String
      parentBrand: String
      store: ID
      active: Boolean
      trending: Boolean
      sale: Boolean
      new: Boolean
      hot: Boolean
      featured: Boolean
      recommended: Boolean
      status: String
      price: String
      where: String
    ): SearchRes @vendor
    product1(id: ID!): OneProduct @vendor #without populated fields
    product(id: ID!): Product #with populated fields
    nextProduct(id: ID!): OneProduct @vendor
    prevProduct(id: ID!): OneProduct @vendor
    popular(
      page: Int
      skip: Int
      limit: Int
      search: String
      sort: String
      q: String
    ): SearchRes
    bestSellers: BestSellers
    productSlug(slug: String!): Product
    search(
      page: Int
      skip: Int
      limit: Int
      city: String
      type: String
      search: String
      sort: String
      q: String
    ): SearchRes
    productSummary: TodaysSummary @vendor
    noStock(
      page: Int
      skip: Int
      limit: Int
      search: String
      sort: String
      category: String
      store: ID
      active: Boolean
    ): SearchRes @vendor
    noImage(
      page: Int
      skip: Int
      limit: Int
      search: String
      sort: String
      category: String
      store: ID
      active: Boolean
    ): SearchRes @vendor
    noPrice(
      page: Int
      skip: Int
      limit: Int
      search: String
      sort: String
      category: String
      store: ID
      active: Boolean
    ): SearchRes @vendor
    invalidPrice(
      page: Int
      skip: Int
      limit: Int
      search: String
      sort: String
      category: String
      store: ID
      active: Boolean
    ): SearchRes @vendor
    noDescription(
      page: Int
      skip: Int
      limit: Int
      search: String
      sort: String
      category: String
      store: ID
      active: Boolean
    ): SearchRes @vendor
    invalidVendor(
      page: Int
      skip: Int
      limit: Int
      search: String
      sort: String
      category: String
      store: ID
      active: Boolean
    ): SearchRes @vendor
    master_id_product(
      page: Int
      skip: Int
      limit: Int
      search: String
      sort: String
      productMasterId: String!
      active: Boolean
    ): SearchRes
    product_group(id: ID!): GroupRes
  }

  extend type Mutation {
    test: Boolean
    deleteAllProducts(password: String!, force: Boolean): Int @admin
    deleteProductViaBarcode(barcodes: [String!]!, force: Boolean): Int @admin
    removeVariant(id: ID!): Boolean @vendor
    # saveVariant(
    #   id: String
    #   name: String
    #   active: Boolean
    #   lat: Float
    #   lng: Float
    # ): Variant @auth
    deleteProduct(id: ID): Boolean @vendor
    createProduct(
      name: String
      description: String
      type: String
      city: String
      price: Float
      stock: Int
      img: String
      time: String
      category: ID
      categories: [String]
    ): Product @vendor
    saveVariant(
      pid: ID!
      id: String
      name: String
      stock: Float
      weight: Float
      length: Float
      height: Float
      width: Float
      barcode: String
      trackInventory: Boolean
      sku: String
      mrp: Float
      price: Float
      img: String
      images: [String]
      sort: Int
      active: Boolean
      options: [OptionIp]
    ): Variant @vendor
    saveProduct(
      id: String!
      name: String
      slug: String
      description: String
      type: String
      city: String
      price: Float
      mrp: Float
      stock: Int
      img: String
      images: [String]
      time: String
      brand: ID
      parentBrand: ID
      category: ID
      categories: [ID!]
      collections: [ID]
      active: Boolean
      popularity: Int
      position: Int
      sku: String
      hsn: String
      barcode: String
      weight: Float
      length: Float
      width: Float
      height: Float
      group: String
      colorCode: String
      colorName: String
      size: ID
      link: String
      condition: String
      gtin: String
      ageMin: Int
      ageMax: Int
      ageUnit: String
      availability: String
      gender: String
      # badge: BadgeI
      active: Boolean
      trending: Boolean
      sale: Boolean
      new: Boolean
      hot: Boolean
      featured: Boolean
      recommended: Boolean
      title: String
      metaDescription: String
      keywords: String
      variants: [ID!]
      itemId: String
      warranty: String
      styleCode: String
      styleId: String
      eanNo: String
      articleCode: String
      productMasterId: String
      currency: String
      manufacturer: String
      returnInfo: String
      countryOfOrigin: String
      cgst: Float
      sgst: Float
      igst: Float
      tax: Float
      colorGroup: [String]
      sizeGroup: [String]
      relatedProducts: [ID!]
      specifications: [ID!]
      replaceAllowed: Boolean
      returnAllowed: Boolean
      returnValidityInDays: Int
      store: ID
      files: [String]
      sizechart: String
      mfgDate: String
      batchNo: String
      expiryDate: String
    ): OneProduct @vendor

    importProduct(file: Upload!): String
    # fileRes
    # saveVariant(
    #   id: ID!
    #   name: String!
    #   price: Int
    #   stock: Int
    #   img: String
    # ): Variant @auth
    updateAllProduct: Int
    syncProductImages: Int
    syncAutoComplete: Int
  }

  input UserIp {
    firstName: String
    lastName: String
    info: InputInfo
  }
  type ColorGroup {
    _id: ID
    color: Color
  }
  type SizeGroup {
    _id: ID
    size: Size
  }
  type fileRes {
    filename: String
    mimetype: String
    encoding: String
    url: String
    productCount: Int
  }
  type BestSellers {
    t: [BS]
    t1: [BS]
    t2: [BS]
    t3: [BS]
    t4: [BS]
  }

  type BS {
    _id: BSDate
    count: Int
    items: [BS1]
    amount: Int
    updatedAt: String
  }

  type BSDate {
    date: String
  }

  type BS1 {
    id: ID
    pid: ID
    name: String
    slug: String
    img: String
    price: Float
    category: Category
    updatedAt: String
    store: String
    time: String
    type: String
    ratings: String
    reviews: String
  }

  type variantRes {
    data: [Variant]
    count: Int
    pageSize: Int
    page: Int
  }
  type SearchRes {
    data: [Product]
    count: Int
    page: Int
    pageSize: Int
    noOfPage: Int
  }

  type GroupRes {
    sizeGroup: [Product]
    colorGroup: [Product]
  }

  input VariantIp {
    id: ID
    images: [String]
    img: String
    price: Float
    mrp: Float
    discount: Float
    name: String
    color: String
    trackInventory: Boolean
    stock: Float
    unit: String
    weight: Float
    length: Float
    width: Float
    height: Float
    sku: String
    barcode: String
    active: Boolean
    sort: Int
    options: [NameValIp]
    enableUnitPrice: Boolean
    saleFromDate: String
    saleToDate: String
  }

  type Variant {
    id: ID!
    images: [String]
    img: String
    price: Float
    mrp: Float
    discount: Float
    name: String
    color: String
    trackInventory: Boolean
    stock: Float
    unit: String
    weight: Float
    length: Float
    height: Float
    width: Float
    sku: String
    barcode: String
    sort: Int
    options: [Option]
    active: Boolean
    enableUnitPrice: Boolean
    saleFromDate: String
    saleToDate: String
    createdAt: String!
    updatedAt: String!
  }
  # all field populated
  type Product {
    _id: ID
    id: ID
    name: String
    description: String
    slug: String
    img: String
    images: [String]
    options: [Option]
    variants: [Variant]
    enableZips: Boolean
    zips: [String!]
    category: Category
    brand: Brand
    parentBrand: Brand
    color: Color
    size: Size
    parentCategory: Category
    categories: [Category!]
    categoryPool: [Category!]
    collections: [Collection]
    status: String
    type: String
    city: String
    stock: Int
    price: Float
    mrp: Float
    discount: Float
    time: String
    sort: Int
    daily: Boolean
    vendor: User
    active: Boolean
    info: String
    title: String
    metaDescription: String
    keywords: String
    position: Float
    popularity: Float
    trending: Boolean
    featured: Boolean
    hot: Boolean
    new: Boolean
    sale: Boolean
    recommended: Boolean
    hsn: String
    barcode: String
    group: String
    gender: String
    gtin: String
    condition: String
    sku: String
    sales: Int
    ratings: Float
    reviews: Int
    approved: Boolean
    keyFeatures: [String]
    features: [Feature]
    productDetails: [Feature]
    specifications: [Feature]
    channels: [Channel]
    createdAt: String!
    updatedAt: String!
    itemId: String
    warranty: String
    ageMin: Int
    ageMax: Int
    ageUnit: String
    styleCode: String
    styleId: String
    eanNo: String
    articleCode: String
    productMasterId: String
    currency: String
    manufacturer: String
    returnInfo: String
    link: String
    countryOfOrigin: String
    cgst: Float
    sgst: Float
    igst: Float
    tax: Float
    weight: Float
    length: Float
    width: Float
    height: Float
    colorGroup: [Product]
    sizeGroup: [Product]
    relatedProducts: [Product]
    replaceAllowed: Boolean
    returnAllowed: Boolean
    returnValidityInDays: Int
    store: Store
    files: [String]
    googleMerchantProductId: String
    sizechart: String
    mfgDate: String
    batchNo: String
    expiryDate: String
  }

  type OneProduct {
    id: ID
    _id: ID
    name: String
    description: String
    slug: String
    img: String
    images: [String]
    options: [ID]
    variants: [ID]
    enableZips: Boolean
    zips: [String!]
    brand: ID
    parentBrand: ID
    color: Color
    size: ID
    unit: ID
    category: ID
    parentCategory: ID
    categories: [ID!]
    categoryPool: [ID!]
    collections: [ID]
    status: String
    type: String
    city: String
    stock: Int
    price: Float
    mrp: Float
    discount: Float
    time: String
    sort: Int
    daily: Boolean
    vendor: ID
    active: Boolean
    info: String
    title: String
    metaDescription: String
    keywords: String
    position: Float
    popularity: Float
    trending: Boolean
    featured: Boolean
    hot: Boolean
    new: Boolean
    sale: Boolean
    recommended: Boolean
    hsn: String
    barcode: String
    group: String
    sku: String
    sales: Int
    ratings: Float
    reviews: Int
    approved: Boolean
    keyFeatures: [String]
    features: [ID]
    productDetails: [Feature]
    specifications: [Feature]
    channels: [ID]
    createdAt: String!
    updatedAt: String!
    gender: String
    gtin: String
    condition: String
    itemId: String
    warranty: String
    link: String
    ageMin: Int
    ageMax: Int
    ageUnit: String
    styleCode: String
    styleId: String
    eanNo: String
    articleCode: String
    productMasterId: String
    returnInfo: String
    countryOfOrigin: String
    currency: String
    manufacturer: String
    cgst: Float
    sgst: Float
    igst: Float
    tax: Float
    weight: Float
    length: Float
    width: Float
    height: Float
    relatedProducts: [OneProduct]
    colorGroup: [String]
    sizeGroup: [String]
    replaceAllowed: Boolean
    returnAllowed: Boolean
    returnValidityInDays: Int
    store: ID
    files: [String]
    googleMerchantProductId: String
    sizechart: String
    mfgDate: String
    batchNo: String
    expiryDate: String
  }
  # type Meta {
  #   info: String
  #   title: String
  #   description: String
  #   keywords: String
  # }
  input BadgeI {
    trending: Boolean
    recommended: Boolean
    hot: Boolean
    sale: Boolean
    new: Boolean
    featured: Boolean
  }

  type Badge {
    trending: Boolean
    recommended: Boolean
    hot: Boolean
    sale: Boolean
    new: Boolean
    featured: Boolean
  }
  type prodEs {
    took: Int
    count: Int
    data: [prodEsData]
  }
  type prodEsData {
    _index: String
    _type: String
    _id: String
    _score: Int
    _source: Product
  }
  # type Stats {
  #   position: Float
  #   popularity: Float
  #   sales: Int
  #   ratings: Float
  #   reviews: Int
  # }
`
