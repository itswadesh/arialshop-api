import { Document } from 'mongoose'
import { StoreDocument, UserDocument } from './'

export interface AddressDocument extends Document {
  // coords: { lat: [number, number]; lng: [number, number] }
  active: boolean
  address: string
  city: string
  company: string
  country: string
  deliveryInstructions: string
  district: string
  email: string
  firstName: string
  isResidential: boolean
  lastName: string
  lat: number
  lng: number
  phone: string
  state: string
  town: string
  type: string
  store: StoreDocument['_id']
  user: UserDocument['_id']
  zip: number
}
