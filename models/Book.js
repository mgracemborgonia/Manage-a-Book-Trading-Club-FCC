const mongoose = require("mongoose");
const {Schema} = mongoose;
const date = new Date();
const BookSchema = new Schema({
  title: { 
    type: String, 
    required: true 
  },
  author: { type: String },
  description: { type: String },
  owner: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: date
  },
});

module.exports = mongoose.model("Book", BookSchema);