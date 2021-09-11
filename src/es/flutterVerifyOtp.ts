import axios from 'axios'
import { API_URL } from '../config'
export default async function (req: any, res: any) {
  try {
    const { phone, otp } = req.query
    const response = await axios.post(`${API_URL}/graphql`, {
      query: `mutation verifyOtp($phone: String!, $otp: String!) {
  verifyOtp(phone: $phone, otp: $otp) {
    id
    firstName
    lastName
    email
    phone
    role
    verified
    active
    avatar
    sid
  }
}`,
      variables: { phone, otp },
    })
    const data = response.data.data.verifyOtp
    data.cookie = response.headers['set-cookie'][0]
    res.status(200).send(data)
  } catch (e) {
    res.status(420).send('Invalid OTP')
  }
}
