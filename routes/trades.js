const express = require('express');
const router = express.Router();
const Trade = require('../models/Trade');
const User = require('../models/User');
const Book = require('../models/Book');

const isAuthenticated = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'User not authenticated' });
  }
  next();
};
router.post('/initiate', isAuthenticated, async (req, res) => {
  const {bookId, userId} = req.body;
  try {
    const book = await Book.findById(bookId);
    const proposer = await User.findById(userId);
    if(!book || !proposer){
      return res.status(400).json({ message: "Invalid book or user" });
    }
    const receiver = await User.findById(book.owner);
    if(!receiver){
      return res.status(400).json({ message: "Book owner not found" });
    }
    const trade = new Trade({
      proposer,
      receiver,
      book,
      status: 'Pending',
    });
    await trade.save();
    res.json({ message: 'Trade request initiated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during trade initiation' });
  }
});
router.get('/mytrades', isAuthenticated, async (req, res) => {
  const userId = req.user._id;
  try {
    const trades = await Trade.find({
      $or: [{ proposer: userId }, { receiver: userId }],
    })
    .populate('proposer receiver book');
    console.log("Fetched Trades: ", trades);
    res.json(trades);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching trades' });
  }
});
router.post('/:tradeId/accept', isAuthenticated, async (req, res) => {
  const {tradeId} = req.params;
  try {
    const trade = await Trade.findById(tradeId);
    if (!trade) {
      return res.status(404).json({ message: 'Trade not found' });
    }
    if (trade.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You are not authorized to accept this trade' });
    }
    trade.status = 'Accepted';
    await trade.save();
    res.json({ message: 'Trade accepted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error accepting trade' });
  }
});
router.post('/:tradeId/decline', isAuthenticated, async (req, res) => {
  const {tradeId} = req.params;
  try {
    const trade = await Trade.findById(tradeId);
    if (!trade) {
      return res.status(404).json({ message: 'Trade not found' });
    }
    if (trade.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You are not authorized to decline this trade' });
    }
    trade.status = 'Declined';
    await trade.save();
    res.json({ message: 'Trade declined successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error declining trade' });
  }
});

module.exports = router;
