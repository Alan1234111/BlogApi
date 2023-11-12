const express = require("express");
const router = express.Router();
const multer = require("multer");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const verifyToken = require("../verifyToken");

const post_controller = require("../controllers/postController");
const tag_controller = require("../controllers/tagController");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, new Date().toISOString().slice(0, 10) + file.originalname);
  },
});

const upload = multer({storage: storage});

// index route
router.get("/", function (req, res, next) {
  res.redirect("/api/posts");
});

// Posts

// register
router.post("/register", async (req, res) => {
  const {username, password} = req.body;
  // Perform input validation here

  if (!password) {
    return res.status(400).json({error: "Password is missing"});
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create and save the user
  const user = new User({username, password: hashedPassword});
  await user.save();

  res.json({message: "User registered successfully"});
});

// Login

router.post("/login", async (req, res) => {
  const {username, password} = req.body;

  const user = await User.findOne({username});

  if (!user) {
    return res.status(401).json({message: "Authentication failed"});
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return res.status(401).json({message: "Authentiaction failed"});
  }

  const token = jwt.sign({userId: user._id, username: user.username}, "secretkey", {expiresIn: "1h"});

  res.json({message: "Authentication successful"});
});

//login to cms

router.post("/cms/login", async (req, res) => {
  const {username, password} = req.body;
  console.log(username);

  const user = await User.findOne({username});

  if (!user) {
    return res.status(401).json({message: "Authentication failed no user"});
  }

  if (!user.admin) {
    return res.status(401).json({message: "You need admin permission"});
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return res.status(401).json({message: "Authentiaction failed"});
  }

  const token = jwt.sign({userId: user._id, username: user.username}, "secretkey", {expiresIn: "1h"});

  res.json({message: "Authentication successful", token});
});

// Posts

router.delete("/posts/:id", verifyToken, post_controller.delete_post);

router.get("/posts/:id", post_controller.get_single_post);

router.post("/posts/:id", verifyToken, upload.single("photoUrl"), post_controller.update_single_post);

router.get("/posts", post_controller.get_posts);

router.post("/posts", verifyToken, upload.single("photoUrl"), post_controller.create_post);

// Tag

router.post("/tags", verifyToken, tag_controller.create_tag);

router.get("/tags", tag_controller.get_tags);

module.exports = router;
