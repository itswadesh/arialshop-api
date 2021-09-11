import mongoose, { Schema } from 'mongoose'
import { PaymentDocument } from '../types'
const { ObjectId } = Schema.Types

const paymentSchema = new Schema(
  {
    // amount_refunded: { type: Number, default: 0 },
    // amount: { type: Number },
    // attempts: { type: Number },
    // balance_transaction: { type: String },
    // bank: { type: String },
    // card_id: { type: String },
    // created_at: { type: Date },
    // created: { type: Date },
    // description: { type: String },
    // entity: { type: String },
    // international: { type: Boolean },
    // livemode: { type: Boolean },
    // metadata: { type: Object },
    // method: { type: String },
    // offer_id: { type: String },
    // outcome: { type: Object },
    // paid: { type: Boolean, default: false },
    // payment_method_details: { type: Object },
    // payment_method: { type: String },  //NEFT, EMI, UPI, Wallters, Cards
    // receipt_email: { type: String },
    // receipt_number: { type: String },
    // receipt_url: { type: String },
    // receipt: { type: String },
    // refund_status: { type: String },
    // refunded: { type: Boolean, default: false },
    // refunds: { type: Object },
    // signature: { type: String },
    // source: { type: Object },
    // status: { type: String }, //txStatus
    // vpa: { type: String },
    // wallet: { type: String },
    amountDue: { type: Number },
    amountPaid: { type: Number },
    totalAmountRefunded: { type: Number, default: 0 },
    captured: { type: Boolean },
    clientSecret: { type: String },
    contact: { type: String },
    currency: { type: String },
    customerName: { type: String },
    description: { type: String },
    email: { type: String },
    errorCode: { type: String },
    errorDescription: { type: String },
    fee: { type: Number },
    invoiceId: { type: String },
    notes: { type: Object },
    orderId: { type: String },
    paid: { type: Boolean, default: false },
    paymentGateway: { type: String }, //razorPay ,paytm, cashfree
    paymentMode: { type: String }, //cod or online
    paymentOrderId: { type: String },
    q: { type: String },
    receipt: { type: String },
    referenceId: { type: String }, //transactionId
    refundStatus: { type: String },
    status: { type: String },
    store: { type: ObjectId, ref: 'Store' },
    tax: { type: Number },
    txMsg: { type: String }, //transaction message
    txTime: { type: String },
  },
  {
    timestamps: true,
  }
)

// paymentSchema.pre('save', async function (this: PaymentDocument) {
//   this.q = this.id ? this.id + ' ' : ''
//   this.q += this.currency ? this.currency.toLowerCase() + ' ' : ''
//   this.q += this.amountPaid ? this.amountPaid + ' ' : ''
//   this.q += this.amountDue ? this.amountDue + ' ' : ''
//   this.q += this.receipt ? this.receipt.toLowerCase() + ' ' : ''
//   this.q += this.status ? this.status.toLowerCase() + ' ' : ''
//   this.q += this.description ? this.description.toLowerCase() + ' ' : ''
//   this.q += this.errorCode ? this.errorCode.toLowerCase() + ' ' : ''
//   this.q += this.errorDescription
//     ? this.errorDescription.toLowerCase() + ' '
//     : ''
//   this.q = this.q.trim()
// })
paymentSchema.index({
  '$**': 'text',
})
export const Payment = mongoose.model<PaymentDocument>('Payment', paymentSchema)
