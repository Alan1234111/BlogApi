require("dotenv").config();
const { body, validationResult } = require("express-validator");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const secretkey = process.env.SECRET_KEY;

exports.register = [
  body("username")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Username is required"),
  body("password")
    .trim()
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),

  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    next();
  },

  async (req, res) => {
    const { username, password } = req.body;

    if (!password) {
      return res.status(400).json({ error: "Password is missing" });
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      const user = new User({ username, password: hashedPassword });
      await user.save();

      res.json({ message: "User registered successfully" });
    } catch (err) {
      console.error("Error " + err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },
];

exports.login = [
  body("username")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Username is required"),
  body("password")
    .trim()
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),

  async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    next();
  },

  async (req, res) => {
    const { username, password } = req.body;

    try {
      const user = await User.findOne({ username });

      if (!user) {
        return res
          .status(401)
          .json({ message: "Authentication failed" });
      }

      const isPasswordValid = await bcrypt.compare(
        password,
        user.password
      );

      if (!isPasswordValid) {
        return res
          .status(401)
          .json({ message: "Authentiaction failed" });
      }

      const token = jwt.sign(
        { userId: user._id, username: user.username },
        secretkey,
        { expiresIn: "1h" }
      );

      res.json({ message: "Authentication successful", token });
    } catch (err) {
      console.error("Error " + err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },
];

exports.loginCms = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });

    if (!user) {
      return res
        .status(401)
        .json({ message: "Authentication failed no user" });
    }

    if (!user.admin) {
      return res
        .status(401)
        .json({ message: "You need admin permission" });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ message: "Authentiaction failed" });
    }

    const token = jwt.sign(
      { userId: user._id, username: user.username },
      secretkey,
      { expiresIn: "1h" }
    );

    res.json({ message: "Authentication successful", token });
  } catch (err) {
    console.error("Error " + err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
