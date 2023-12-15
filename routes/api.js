const express = require("express");
const router = express.Router();
const multer = require("multer");
const User = require("../models/user");
const verifyToken = require("../verifyToken");

const post_controller = require("../controllers/postController");
const tag_controller = require("../controllers/tagController");
const comment_controller = require("../controllers/commentController");
const auth_controller = require("../controllers/authController");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      new Date().toISOString().slice(0, 10) + file.originalname
    );
  },
});

const upload = multer({ storage: storage });

// index route
router.get("/", function (req, res, next) {
  res.redirect("/api/posts");
});

// Register

router.post("/register", auth_controller.register);

// Login

router.post("/login", auth_controller.login);

//login to cms

router.post("/cms/login", auth_controller.loginCms);

// Posts

router.get("/posts/first-five", post_controller.get_first_five_posts);

router.get("/posts/latests", post_controller.get_latest_posts);

router.delete("/posts/:id", verifyToken, post_controller.delete_post);

router.get("/posts/:id", post_controller.get_single_post);

router.post(
  "/posts/:id",
  verifyToken,
  upload.single("photoUrl"),
  post_controller.update_single_post
);

router.get("/posts", post_controller.get_posts);

router.post(
  "/posts",
  verifyToken,
  upload.single("photoUrl"),
  post_controller.create_post
);

// Tag

router.post("/tags", verifyToken, tag_controller.create_tag);

router.get("/tags/random", tag_controller.get_random_tags);

router.get("/tags/:id", tag_controller.get_post_from_tag);

router.get("/tags", tag_controller.get_tags);

// Comments

router.get(
  "/posts/:postid/comments",
  comment_controller.allCommentsOnPost
);

router.post(
  "/posts/:postid/comments",
  verifyToken,
  comment_controller.createComment
);

router.put("/comments", verifyToken, comment_controller.updateLike);

module.exports = router;
