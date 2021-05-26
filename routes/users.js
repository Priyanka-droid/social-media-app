const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const User = require("../models/User");

router.put("/:id", async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    if (req.body.password) {
      try {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt);
      } catch (e) {
        return res.status(500).send(e.message);
      }
    }
    try {
      //   console.log(req.body);
      const user = await User.findByIdAndUpdate(req.params.id, {
        $set: req.body,
      });
      //   console.log(user);
      res.status(200).send("Account has been updated");
    } catch (e) {
      res.status(500).send(e.message);
    }
  } else {
    return res.status(403).send("you can update only your acount");
  }
});

router.delete("/:id", async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    try {
      //   console.log(req.body);
      const user = await User.findById(req.body.userId);
      if (user) {
        await User.deleteOne({ _id: req.params.id });
        //   console.log(user);
        res.status(200).send("Account has been deleted");
      } else {
        res.status(404).send("user doesnot exist");
      }
    } catch (e) {
      res.status(500).send(e.message);
    }
  } else {
    return res.status(403).send("you can delete only your acount");
  }
});

router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    console.log(user);
    if (user) {
      const { password, upadatedAt, ...other } = user._doc;
      res.status(200).send(other);
    } else res.status(404).send("not found");
  } catch (e) {
    res.status(404).send(e);
  }
});

// follow a user

router.put("/:id/follow", async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currUser = await User.findById(req.body.userId);
      if (user && currUser) {
        if (!user.followers.includes(req.body.userId)) {
          await user.updateOne({ $push: { followers: req.body.userId } });
          await currUser.updateOne({ $push: { followings: req.params.id } });

          console.log(user.followers);
          console.log(req.body.userId);
          res
            .status(200)
            .send(`${currUser.username} now follows ${user.username}`);
        } else {
          res.status(403).send("You already follow this user");
        }
      } else {
        res.status(403).send("User you wanna follow does not exist");
      }
    } catch (e) {
      res.status(403).send(e.message);
    }
  } else {
    res.status(403).send("you can't follow yourself");
  }
});

router.put("/:id/unfollow", async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currUser = await User.findById(req.body.userId);
      if (user && currUser) {
        if (user.followers.includes(req.body.userId)) {
          await user.updateOne({ $pull: { followers: req.body.userId } });
          await currUser.updateOne({ $pull: { followings: req.params.id } });

          console.log(user.followers);
          console.log(req.body.userId);
          res
            .status(200)
            .send(`${currUser.username} now does not follow ${user.username}`);
        } else {
          res.status(403).send("You don't follow this user already");
        }
      } else {
        res.status(403).send("User you wanna unfollow does not exist");
      }
    } catch (e) {
      res.status(403).send(e.message);
    }
  } else {
    res.status(403).send("you can't unfollow yourself");
  }
});
module.exports = router;
