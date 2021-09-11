import { Schema, model } from 'mongoose'
import * as mongoose from 'mongoose'
import { OptionValueDocument } from '../types'
import { Double } from 'bson'
import { generateSlug } from '../utils'

const { ObjectId } = Schema.Types

const optionValueSchema = new mongoose.Schema({
  active: { type: Boolean, default: true },
  amount: { type: Number, default: 0 }, //price_modifier_amt
  default: { type: Boolean },
  direction: { type: String, enum: ['+', '-'] }, //price_modifier_direction
  name: { type: String, required: true },
  option_id: { type: ObjectId, ref: 'Option' },
  position: { type: Number, default: 0 },
  type: { type: String, enum: ['$', '%'] }, //price_modifier_type
  user: { type: ObjectId, ref: 'User' }, //created By
})

optionValueSchema.pre('save', async function (this: OptionValueDocument) {
  if (this.name)
    this.name =
      this.name.charAt(0).toUpperCase() + this.name.substr(1).toLowerCase()
  // this.slug = await generateSlug(this.name, this.slug, 'string')
})

optionValueSchema.index({
  '$**': 'text',
})
export const OptionValue = mongoose.model<OptionValueDocument>(
  'OptionValue',
  optionValueSchema
)
