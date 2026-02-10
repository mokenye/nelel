const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: ["Housing", "Food", "Transportation", "Entertainment", "Utilities", "Other"],
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Links the transaction to your existing User model
    required: true,
    index: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Transaction", TransactionSchema);