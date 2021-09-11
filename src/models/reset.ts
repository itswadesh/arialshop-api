import { Schema, Document, Model, model } from 'mongoose'
import { randomBytes, createHmac, timingSafeEqual } from 'crypto'
import {
  PASSWORD_RESET_BYTES,
  APP_SECRET,
  PASSWORD_RESET_TIMEOUT,
  WWW_URL,
} from '../config'

interface PasswordResetDocument extends Document {
  userId: string
  token: string
  referrer: string
  expiredAt: Date
  url: (plaintextToken: string, referrer: string) => string
  isValid: (plaintextToken: string) => boolean
}

interface PasswordResetModel extends Model<PasswordResetDocument> {
  plaintextToken: () => string
  hashedToken: (plaintextToken: string) => string
}

const passwordResetSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    token: { type: String },
    referrer: { type: String },
    expiredAt: { type: Date },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
)

passwordResetSchema.pre<PasswordResetDocument>('save', function () {
  if (this.isModified('token')) {
    // @ts-ignore
    this.token = PasswordReset.hashedToken(this.token)
  }

  if (!this.expiredAt) {
    this.expiredAt = new Date(new Date().getTime() + PASSWORD_RESET_TIMEOUT)
  }
})

passwordResetSchema.methods.url = function (
  plaintextToken: string,
  referrer: string
) {
  return `${referrer}/account/reset-password?id=${this.id}&token=${plaintextToken}`
}

passwordResetSchema.methods.isValid = function (plaintextToken: string) {
  // @ts-ignore
  const hash = PasswordReset.hashedToken(plaintextToken)
  const t: any = this
  return (
    timingSafeEqual(Buffer.from(hash), Buffer.from(t.token)) &&
    t.expiredAt > new Date()
  )
}

passwordResetSchema.statics.plaintextToken = () => {
  return randomBytes(PASSWORD_RESET_BYTES).toString('hex')
}

passwordResetSchema.statics.hashedToken = (plaintextToken: string) => {
  return createHmac('sha256', APP_SECRET).update(plaintextToken).digest('hex')
}

// @ts-ignore
export const PasswordReset = model<PasswordResetDocument, PasswordResetModel>(
  'PasswordReset',
  // @ts-ignore
  passwordResetSchema
)
