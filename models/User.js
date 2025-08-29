const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const {Schema} = mongoose;
const UserSchema = new Schema({
  fullName: { type: String },
  username: { 
    type: String, 
    required: true, 
    unique: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  city: { type: String },
  state: { type: String },
});

UserSchema.pre("save", async function (next) {
  const user = this;
  if (!user.isModified("password")) return next();
  try{
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    return next();
  }catch (error){
    return next(error);
  }
});

UserSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", UserSchema);