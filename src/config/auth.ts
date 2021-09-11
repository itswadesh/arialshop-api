const ONE_HOUR = 1000 * 60 * 60

const TWELVE_HOURS = ONE_HOUR * 12

// Bcrypt

export const BCRYPT_WORK_FACTOR = 12

export const BCRYPT_MAX_BYTES = 72

// Verification email

export const EMAIL_VERIFICATION_TIMEOUT = TWELVE_HOURS

// sha1 -> 160 bits / 8 = 20 bytes * 2 (hex) = 40 bytes
export const EMAIL_VERIFICATION_TOKEN_BYTES = 40

// sha256 -> 256 bits / 8 = 32 bytes * 2 (hex) = 64 bytes
export const EMAIL_VERIFICATION_SIGNATURE_BYTES = 64

// Password reset

export const PASSWORD_RESET_BYTES = 40

export const PASSWORD_RESET_TIMEOUT = ONE_HOUR

export const {
  GOOGLE_CLIENT_ID = 'GOOGLE_CLIENT_ID',
  GOOGLE_CLIENT_SECRET = 'GOOGLE_CLIENT_SECRET',
  GOOGLE_MERCHANT_ID = 'GOOGLE_MERCHANT_ID',
  GOOGLE_REDIRECT_URI = 'http://localhost:7774/auth/google/callback',
  GOOGLE_SHOPPING_SCOPE = 'https://www.googleapis.com/auth/content',
  GOOGLE_SHIPPONG_BASE_URL = 'https://shoppingcontent.googleapis.com/content/v2.1/',
  FACEBOOK_APP_ID = 'FACEBOOK_APP_ID',
  FACEBOOK_APP_SECRET = 'FACEBOOK_APP_SECRET',
  FACEBOOK_CATALOG_ID = 'FACEBOOK_CATALOG_ID',
  FACEBOOK_BASE_URL = 'https://graph.facebook.com/v11.0/',
  FB_PAGE_ID = 'FB_PAGE_ID',
} = process.env
