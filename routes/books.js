const express = require("express");
const router = express.Router();
const Book = require("../models/Book");

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  return res.status(401).json({ message: "Not authenticated" });
}

router.post("/add", ensureAuthenticated, async (req, res) => {
  try {
    const {title, author, description} = req.body;
    if (!title) return res.status(400).json({ 
      message: "Title is required" 
    });
    const book = new Book({
      title,
      author,
      description,
      owner: req.user._id,
    });
    await book.save();
    res.json({ 
      message: "You successfully added a new book.", 
      book 
    });
  } catch (err) {
    res.status(500).json({ 
      message: err.message 
    });
  }
});

router.get("/", async (req, res) => {
  try {
    const books = await Book.find().populate("owner", "username fullName city state");
    res.json(books);
  } catch (err) {
    res.status(500).json({ 
      message: err.message 
    });
  }
});

module.exports = router;