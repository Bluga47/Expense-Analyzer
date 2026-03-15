
import mongoose from 'mongoose';

const ExpenseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  category: { type: String, required: true },
  merchant: { type: String, required: true },
  date: { type: Date, default: Date.now },
  paymentMethod: { type: String, required: true },
  notes: { type: String },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'reimbursed'], default: 'approved' }
});

export default mongoose.model('Expense', ExpenseSchema);
