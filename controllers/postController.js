require("dotenv").config();
const Post = require("../models/post");
const Comment = require("../models/comment");
const Tag = require("../models/tag");
const { body, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");

const secretkey = process.env.SECRET_KEY;

exports.get_posts = async (req, res, next) => {
  try {
    const posts = await Post.find({})
      .populate("comment")
      .populate("tag")
      .sort({ createdAt: -1 })
      .exec();
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

    next();
  },

  async (req, res) => {
    try {
      jwt.verify(
        req.token,
        secretkey,
        async (err, user, authData) => {
          if (err) {
            res.sendStatus(403);
          }
          const { title, text, tag, isPublished } = req.body;

          const post = new Post({
            title,
            text,
            author: user.username,
            tag,
            isPublished,
            photoUrl: req.file.path,
          });

          await post.save();

          res
            .status(201)
            .json({ message: "Created Post successfully" });
        }
      );
    } catch (err) {
      console.error("Error " + err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },
];

exports.get_single_post = async (req, res, next) => {
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
    console.error("Error " + err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.get_first_five_posts = async (req, res, next) => {
  try {
    const posts = await Post.find()
      .limit(5)
      .populate("comment")
      .populate("tag")
      .exec();

    if (!posts) {
      return res.status(404).json({ err: "posts not found" });
    }
    res.status(200).json({ posts });
  } catch (err) {
    console.error("Error " + err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.get_latest_posts = async (req, res, next) => {
  try {
    const latestPosts = await Post.find()
      .populate("comment")
      .populate("tag")
      .sort({ createdAt: -1 })
      .limit(8)
      .exec();

    res.status(200).json({ posts: latestPosts });
  } catch (err) {
    console.error("Error " + err);
    return res.status(500).json({ error: "Internal Server Error" });
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
    try {
      jwt.verify(req.token, secretkey, async (err, authData) => {
        if (err) {
          res.sendStatus(403);
        }
        const postId = req.params.id;
        const { title, text, tag } = req.body;

        const post = await Post.findById(postId)
          .populate("tag")
          .exec();

        if (!post) {
          return res.status(404).json({ err: "Post not found" });
        }

        post.title = title;
        post.text = text;
        post.tag = tag;

        if (req.file) {
          post.photoUrl = req.file.path;
        }

        const updatedPost = await post.save();

        res.status(200).json({
          message: "Post updated successfully",
          post: updatedPost,
        });
      });
    } catch (err) {
      console.error("Error " + err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },
];

exports.delete_post = async (req, res) => {
  try {
    jwt.verify(req.token, secretkey, async (err, authData) => {
      if (err) {
        res.sendStatus(403);
      }
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
      } catch (err) {
        console.error("Error " + err);
        return res
          .status(500)
          .json({ error: "Internal Server Error" });
      }
    });
  } catch (err) {
    console.error("Error " + err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
