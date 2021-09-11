import { gql } from 'apollo-server-express'

export default gql`
  extend type Query {
    addresses(
      page: Int
      search: String
      limit: Int
      sort: String
      store: ID
    ): addressRes @support
    myAddresses(
      page: Int
      search: String
      limit: Int
      sort: String
      store: ID
    ): addressRes @auth
    address(
      """
      MongoDB ObjectId of address
      """
      id: ID!
    ): Address @auth
    getLocation(lat: Float, lng: Float): Address
    getLocationFromZip(zip: Int!): Address
    getCoordinatesFromZip(zip: Int!): Coords
    getNearbyVendors: [Address]
  }

  extend type Mutation {
    deleteAddress(id: ID!): Boolean @auth

    addAddress(
      email: String
      firstName: String
      lastName: String
      type: String
      address: String
      town: String
      city: String
      district: String
      company: String
      country: String
      state: String
      # coords: Geo
      lat: Float
      lng: Float
      zip: Int
      phone: String
      isResidential: Boolean
      store: ID
    ): Address @auth
    saveAddress(
      id: String!
      email: String
      firstName: String
      lastName: String
      type: String
      address: String
      town: String
      district: String
      city: String
      country: String
      state: String
      # coords: Geo
      lat: Float
      lng: Float
      zip: Int
      phone: String
      active: Boolean
      isResidential: Boolean
      store: ID
    ): Address @auth
    updateAddress(
      id: ID!
      email: String
      firstName: String
      lastName: String
      type: String
      address: String
      town: String
      district: String
      city: String
      country: String
      state: String
      # coords: Geo
      lat: Float
      lng: Float
      zip: Int
      phone: String
      deliveryInstructions: String
      active: Boolean
      isResidential: Boolean
      store: ID
    ): Address @auth
  }

  type addressRes {
    data: [Address]
    count: Int
    pageSize: Int
    page: Int
  }

  type Address {
    id: ID!
    email: String
    firstName: String
    lastName: String
    type: String
    address: String
    town: String
    city: String
    district: String
    country: String
    state: String
    # coords: Coords
    lat: Float
    lng: Float
    zip: Int
    phone: String
    active: Boolean
    isResidential: Boolean
    user: ID
    store: ID
    createdAt: String!
    updatedAt: String!
  }

  type OneAddress {
    id: ID!
    email: String
    firstName: String
    lastName: String
    type: String
    address: String
    town: String
    city: String
    district: String
    country: String
    state: String
    # coords: Coords
    lat: Float
    lng: Float
    zip: Int
    phone: String
    active: Boolean
    isResidential: Boolean
    user: ID
    store: ID
    createdAt: String!
    updatedAt: String!
  }
  # input Geo {
  #   lat: Float
  #   lng: Float
  # }

  type Coords {
    lat: Float
    lng: Float
  }
`
