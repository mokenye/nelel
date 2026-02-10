const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  userName: { type: String, unique: true },
  email: { type: String, unique: true },
  password: String,
  age: { type: Number },
  state: { type: String },
  income: { type: Number, default: 0 } ,
  currentsavings: { type: Number, default: 0 },
  targetSavingsRate: { type: Number, default: 20 }, // percentage
  retirementAge: { type: Number },
  monthlyNetIncome: { type: Number, default: 0 },
  annualNetIncome: { type: Number, default: 0 },
  goals: [{
    name: { type: String },
    amount: { type: Number, default: 0 }
  }],
});

// Password hash middleware.

UserSchema.pre('save', async function () {
  const user = this
  // If password isn't modified, just return (Mongoose handles the 'next' part)
  if (!user.isModified('password')) {
    return 
  }

  try {
    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(user.password, salt)
    user.password = hash
  } catch (err) {
    throw err // Mongoose will catch this error
  }
})

// Helper method for validating user's password.

UserSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
}

module.exports = mongoose.model("User", UserSchema);
