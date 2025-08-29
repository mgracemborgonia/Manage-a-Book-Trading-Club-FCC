const mongoose = require('mongoose');
const {Schema} = mongoose;
const tradeSchema = new Schema({
  proposer: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  receiver: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  book: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Book', 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['Pending', 'Accepted', 'Declined'], 
    default: 'Pending' 
  },
}, { timestamps: true });

module.exports = mongoose.model('Trade', tradeSchema);
