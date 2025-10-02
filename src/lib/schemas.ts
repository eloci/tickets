import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema({
  clerkId: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  name: String,
  image: String,
  role: { type: String, enum: ['USER', 'ADMIN', 'ORGANIZER'], default: 'USER' },
}, { timestamps: true })

const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  date: { type: Date, required: true },
  time: String,
  venue: String,
  address: String,
  city: String,
  imageUrl: String,
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['DRAFT', 'PUBLISHED', 'CANCELLED'], default: 'DRAFT' },
}, { timestamps: true })

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  totalTickets: { type: Number, required: true },
  soldTickets: { type: Number, default: 0 },
  benefits: { type: [String], default: [] },
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
}, { timestamps: true })

const OrderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['PENDING', 'CONFIRMED', 'CANCELLED'], default: 'PENDING' },
  paymentMethod: String,
  paymentIntentId: String,
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })

// Virtual populate: tickets belonging to this order
OrderSchema.virtual('tickets', {
  ref: 'Ticket',
  localField: '_id',
  foreignField: 'order'
})

const TicketSchema = new mongoose.Schema({
  ticketNumber: { type: String, required: true, unique: true },
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  price: { type: Number, required: true },
  qrCode: String,
  status: { type: String, enum: ['VALID', 'USED', 'CANCELLED'], default: 'VALID' },
  usedAt: Date,
}, { timestamps: true })

const PaymentSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  amount: { type: Number, required: true },
  method: { type: String, required: true },
  status: { type: String, enum: ['PENDING', 'COMPLETED', 'FAILED'], default: 'PENDING' },
  transactionId: String,
  metadata: mongoose.Schema.Types.Mixed,
}, { timestamps: true })

export const User = mongoose.models.User || mongoose.model('User', UserSchema)
export const Event = mongoose.models.Event || mongoose.model('Event', EventSchema)
export const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema)
export const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema)
export const Ticket = mongoose.models.Ticket || mongoose.model('Ticket', TicketSchema)
export const Payment = mongoose.models.Payment || mongoose.model('Payment', PaymentSchema)