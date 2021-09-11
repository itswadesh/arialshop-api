import axios from 'axios'
import {
  SHIPROCKET_BASE_URL,
  SHIPROCKET_EMAIL,
  SHIPROCKET_PASSWORD,
} from '../../config'

//Generate AWB (Air Waybill Number)  for Shipment(This is a unique number that helps you track the shipment and get details about it.)
export const generateAWBForShipment = async ({
  token,
  shipment_id,
  courier_id,
  status,
}: any) => {
  const data = JSON.stringify({
    shipment_id: '',
    courier_id: '', //The courier id of the courier service you want to select.Available on shiprocket api doc
    status: '', //Use this to change the courier of a shipment. Value: reassign Note that this can be done only once in 24 hours.
  })

  const config: any = {
    method: 'post',
    url: `${SHIPROCKET_BASE_URL}/courier/assign/awb`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    data: data,
  }
  const response: any = await axios(config)
}

//Check Courier Serviceability
export const serviceability = async (token) => {
  const config: any = {
    method: 'post',
    url: `${SHIPROCKET_BASE_URL}/courier/serviceability`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  }
  const response: any = await axios(config)
}

//Check International Courier Serviceability
export const internationalServiceability = async (token) => {
  const config: any = {
    method: 'post',
    url: `${SHIPROCKET_BASE_URL}/courier/international/serviceability`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  }
  const response: any = await axios(config)
}

//Request for Shipment Pickup
export const requestForShipmentPickup = async (token) => {
  const data = JSON.stringify({
    shipment_id: [''],
  })
  const config: any = {
    method: 'post',
    url: `${SHIPROCKET_BASE_URL}/courier/generate/pickup`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    data: data,
  }
  const response: any = await axios(config)
}
