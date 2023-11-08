const express = require("express");
const router = express.Router();
const multer = require("multer");

const post_controller = require("../controllers/postController");
const tag_controller = require("../controllers/tagController");

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

// Posts

router.get("/posts/:id", post_controller.get_single_post);

router.post(
  "/posts/:id",
  upload.single("photoUrl"),
  post_controller.update_single_post
);

router.post(
  "/posts",
  upload.single("photoUrl"),
  post_controller.create_post
);

router.get("/posts", post_controller.get_posts);

// Tag

router.post("/tags", tag_controller.create_tag);

router.get("/tags", tag_controller.get_tags);

module.exports = router;
