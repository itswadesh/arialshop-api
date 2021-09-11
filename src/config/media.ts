export const {
  CLOUDINARY_KEY = 'CLOUDINARY_KEY',
  CLOUDINARY_SECRET = 'CLOUDINARY_SECRET',
  S3_BUCKET_NAME = 'S3_BUCKET_NAME',
  S3_ACCESS_KEY = 'S3_ACCESS_KEY',
  S3_SECRET = 'S3_SECRET',
  S3_REGION = 'S3_REGION',
  ITEMS_COUNT = 5,
  AZURE_STORAGE_CONNECTION_STRING = 'AZURE_STORAGE_CONNECTION_STRING',
  CDN_URL = `https://${S3_BUCKET_NAME}.s3.${S3_REGION}.amazonaws.com`,
  S3_BUCKET_URL = 'USED AT LAMBDA.TS',
  AZURE_STORAGE_CDN_URL = 'AZURE_STORAGE_CDN_URL',
} = process.env