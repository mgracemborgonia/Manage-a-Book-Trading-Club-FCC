const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/User");

router.get('/current', (req, res) => {
  if (req.user) {
    res.json({ user: req.user });
  } else {
    res.status(401).json({ message: 'User not logged in' });
  }
});
router.post("/register", async (req, res) => {
  try {
    const { fullName, username, password, city, state } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password required" });
    }
    let user = await User.findOne({ username });
    if (user) return res.status(400).json({ message: "User already exists" });
    user = new User({ fullName, username, password, city, state });
    await user.save();
    res.json({ message: "You are successfully registered." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.post("/login", passport.authenticate("local"), (req, res) => {
  res.json({ 
    message: "You are now logged in.", 
    user: req.user 
  });
});
router.put("/settings", (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
  const { fullName, city, state } = req.body;
  User.findByIdAndUpdate(
    req.user._id,
    { fullName, city, state },
    { new: true }
  )
    .then((user) => res.json({ 
      message: "Settings updated", 
      user 
    }))
    .catch((error) => res.status(500).json({ message: error.message }));
});

router.get("/logout", (req, res) => {
  req.logout(() => {
    res.json({ message: "You are now logged out." });
  });
});

module.exports = router;