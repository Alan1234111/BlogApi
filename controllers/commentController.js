const { body, validationResult } = require("express-validator");
const Post = require("../models/post");
const User = require("../models/user");
const Comment = require("../models/comment");

exports.allCommentsOnPost = async (req, res, next) => {
  try {
    let comments = await Comment.find({ postId: req.params.postid });

    return res.status(200).json(comments);
  } catch (err) {
    return res.status(500).json({ err: "Internal Server Error" });
  }
};

exports.allComments = async (req, res, next) => {
  try {
    let comments = await Comment.find({});
    if (!comments) {
      return res.status(404).json({ message: "No comments" });
    }
    return res.status(200).json({ comments });
  } catch (err) {
    return next(err);
  }
};

exports.createComment = [
  body("comment")
    .trim()
    .isLength({ min: 1 })
    .withMessage("You have left an empty comment"),

  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
        data: req.body,
      });
    }

    try {
      const comment = new Comment({
        comment: req.body.comment,
        postId: req.params.postid,
      });

      // Save the comment asynchronously
      await comment.save();

      // Update the associated post with the comment
      await Post.findOneAndUpdate(
        { _id: req.params.postid },
        { $push: { comment: comment } }
      );

      res.status(200).json({ message: "Comment saved", comment });
    } catch (err) {
      res.status(400).json({ err });
    }
  },
];
