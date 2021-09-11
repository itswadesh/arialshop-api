export const {
  NODE_ENV = 'development',
  APP_PORT = 7000,
  APP_HOSTNAME = 'localhost',
  APP_PROTOCOL = 'http',
  WWW_URL = `${APP_PROTOCOL}://${APP_HOSTNAME}:${APP_PORT}`,
  ADMIN_PANEL_LINK = `https://dashboard.litekart.in`,
  APP_SECRET = '4d2ca599b4189f74a771f44b8a8d06f572208b5649f5ae216f8e94612a267ff0',
} = process.env
export const { API_URL = `http://localhost:${APP_PORT}` } = process.env
// export const API_URL = `https://tapi.litekart.in`
export const IN_PROD = NODE_ENV === 'production'
