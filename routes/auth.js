const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
    });
    await newUser.save();
    res.status(201).send("sent");
  } catch (e) {
    res.status(401).send(e.message);
  }
});

router.post("/login", async (req, res) => {
  try {
    const email = req.body.email;
    const user = await User.findOne({ email });
    if (!user) res.status(404).send("No user");
    else {
      const validPassword = await bcrypt.compare(
        req.body.password,
        user.password
      );
      if (!validPassword) res.status(400).send("Wrong Password");
      else res.send(user);
    }
  } catch (e) {
    res.status(404).send(e);
  }
});
module.exports = router;
