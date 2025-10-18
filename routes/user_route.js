const express = require("express");
const router = express.Router();
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const UserModel = mongoose.model("UserModel");
const { JWT_SECRET } = require("../config");
const protectedResource = require("../middleware/protectedResource");

router.post("/register", (req, res) => {
  const { name, email, password, avatar } = req.body;
  if (!name || !password || !email) {
    return res
      .status(400)
      .json({ error: "One or more mandatory fields are empty" });
  }
  UserModel.findOne({ email: email })
    .then((userInDB) => {
      if (userInDB) {
        return res
          .status(500)
          .json({ error: "User with this email already registered" });
      }
      bcryptjs
        .hash(password, 16)
        .then((hashedPassword) => {
          const user = new UserModel({
            name,
            email,
            password: hashedPassword,
            avatar,
          });
          user
            .save()
            .then((newUser) => {
              res.status(201).json({ result: "User Signed up Successfully!" });
            })
            .catch((err) => {
              console.log(err);
            });
        })
        .catch((err) => {
          console.log(err);
        });
    })
    .catch((err) => {
      console.log(err);
    });
});

router.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (!password || !email) {
    return res
      .status(400)
      .json({ error: "One or more mandatory fields are empty" });
  }
  UserModel.findOne({ email: email })
    .then((userInDB) => {
      if (!userInDB) {
        return res.status(401).json({ error: "Invalid Credentials" });
      }
      bcryptjs
        .compare(password, userInDB.password)
        .then((didMatch) => {
          if (didMatch) {
            const jwtToken = jwt.sign({ _id: userInDB._id }, JWT_SECRET);
            const userInfo = {
              _id: userInDB._id,
              email: userInDB.email,
              name: userInDB.name,
              avatar: userInDB.avatar,
            };
            res
              .status(200)
              .json({ result: { token: jwtToken, user: userInfo } });
          } else {
            return res.status(401).json({ error: "Invalid Credentials" });
          }
        })
        .catch((err) => {
          console.log(err);
        });
    })
    .catch((err) => {
      console.log(err);
    });
});

router.get("/getAllUsers", protectedResource, (req, res) => {
  UserModel.find()
    .then((users) => {
      res.status(200).json({ users });
    })
    .catch((err) => {
      console.log(err);
    });
});

router.get("/getUser/:userId", (req, res) => {
  const userId = req.params.userId;
  UserModel.findById(userId)
    .then((user) => {
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.status(200).json({ user });
    })
    .catch((err) => {
      console.log(err);
    });
});

router.delete("/deleteUser/:userId", protectedResource, (req, res) => {
  const userId = req.params.userId;
  UserModel.findByIdAndDelete(userId)
    .then((user) => {
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.status(200).json({ message: "User deleted successfully" });
    })
    .catch((err) => {
      console.log(err);
    });
});

module.exports = router;