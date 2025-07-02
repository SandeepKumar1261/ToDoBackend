const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../model/User");
const dotenv = require("dotenv");

dotenv.config();

const jwtSecretEKy = process.env.JWT_SECRET;

router.post("/signup", async (req, res) => {
  const { email, password } = req.body;

  try {
    console.log(
      "in the my world ---------------",
      jwtSecretEKy,
      process.env.JWT_SECRET
    );

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ msg: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ email, password: hashedPassword });

    await newUser.save();
    res.status(201).json({ user: { id: newUser._id, email: newUser.email } });
  } catch (err) {
    res.status(500).json({ msg: "Signup failed", error: err.message });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, jwtSecretEKy, { expiresIn: "1d" });

    res.json({ token, user: { id: user._id, email: user.email } });
  } catch (err) {
    res.status(500).json({ msg: "Login failed", error: err.message });
  }
});

module.exports = router;
