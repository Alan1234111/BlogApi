const Post = require("../models/post");
const Comment = require("../models/comment");
const Tag = require("../models/tag");
const { body, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");

exports.get_posts = async function (req, res, next) {
  try {
    const posts = await Post.find({}).populate("tag").exec();
    if (!posts) {
      return res.status(404).json({ err: "posts not found" });
    }
    res.status(200).json({ posts });
  } catch (err) {
    next(err);
  }
};

exports.create_post = [
  body("title")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Title is required"),
  body("text")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Text is required"),
  body("tag")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Tag is required"),
  body("isPublished")
    .isBoolean()
    .withMessage("isPublished must be a boolean"),

  async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // If validation passes, proceed to the next middleware
    next();
  },
  function (req, res, next) {
    jwt.verify(req.token, "secretkey", (err, authData) => {
      if (err) {
        res.sendStatus(403);
      } else {
        const { title, text, tag, isPublished } = req.body;

        const post = new Post({
          title,
          text,
          author: "Alan",
          tag,
          isPublished,
          photoUrl: req.file.path,
        });

        post
          .save()
          .then((result) => {
            res.status(201).json({
              message: "Created Post successfully",
            });
          })
          .catch((err) => {
            console.log(err);
            res.status(500).json({
              error: err,
            });
          });
      }
    });
  },
];

exports.get_single_post = async function (req, res, next) {
  try {
    const post = await Post.findById(req.params.id)
      .populate("comment")
      .populate("tag")
      .exec();
    if (!post) {
      return res.status(404).json({ err: "post not found" });
    }
    res.status(200).json({ post });
  } catch (err) {
    next(err);
  }
};

exports.update_single_post = [
  body("title")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Title is required"),
  body("text")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Text is required"),
  body("tag")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Tag is required"),

  async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    next();
  },

  async (req, res, next) => {
    jwt.verify(req.token, "secretkey", async (err, authData) => {
      if (err) {
        res.sendStatus(403);
      } else {
        try {
          const postId = req.params.id; // Get the post ID from the request parameters
          const { title, text, tag } = req.body;

          // Find the post by its ID
          const post = await Post.findById(postId)
            .populate("tag")
            .exec();

          if (!post) {
            return res.status(404).json({ err: "Post not found" });
          }

          // Update the post properties (excluding the image)
          post.title = title;
          post.text = text;
          post.tag = tag;

          if (req.file) {
            post.photoUrl = req.file.path; // Update the image path
          }

          // Save the updated post
          const updatedPost = await post.save();

          res.status(200).json({
            message: "Post updated successfully",
            post: updatedPost,
          });
        } catch (err) {
          next(err);
        }
      }
    });
  },
];

exports.delete_post = async (req, res) => {
  jwt.verify(req.token, "secretkey", async (err, authData) => {
    if (err) {
      res.sendStatus(403);
    } else {
      const postId = req.params.id;

      try {
        const deletedPost = await Post.findByIdAndDelete(postId);

        if (!deletedPost) {
          return res.status(404).json({ message: "Post not found" });
        }

        res.json({
          message: "Post deleted successfully",
          deletedPost,
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  });
};
