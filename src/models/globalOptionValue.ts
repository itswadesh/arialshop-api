import mongoose, { Schema } from 'mongoose'
import { GlobalOptionValueDocument } from '../types'
const { ObjectId } = Schema.Types

const globalOptionValueSchema = new mongoose.Schema({
  active: { type: Boolean, default: true },
  default: { type: Boolean },
  global_option_id: { type: ObjectId, ref: 'GlobalOption' },
  name: { type: String, required: true },
  position: { type: Number, default: 0 },
  user: { type: ObjectId, ref: 'User' }, //created By
})

globalOptionValueSchema.pre(
  'save',
  async function (this: GlobalOptionValueDocument) {
    if (this.name)
      this.name =
        this.name.charAt(0).toUpperCase() + this.name.substr(1).toLowerCase()
  }
)

globalOptionValueSchema.index({
  '$**': 'text',
})
export const GlobalOptionValue = mongoose.model<GlobalOptionValueDocument>(
  'GlobalOptionValue',
  globalOptionValueSchema
)
