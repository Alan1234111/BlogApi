require("dotenv").config();
const {body, validationResult} = require("express-validator");
const Post = require("../models/post");
const User = require("../models/user");
const Comment = require("../models/comment");
const jwt = require("jsonwebtoken");

const secretkey = process.env.SECRET_KEY;

exports.allCommentsOnPost = async (req, res, next) => {
  try {
    let comments = await Comment.find({postId: req.params.postid}).populate("user").exec();

    console.log(comments);

    return res.status(200).json(comments);
  } catch (err) {
    return res.status(500).json({err: "Internal Server Error"});
  }
};

exports.allComments = async (req, res, next) => {
  try {
    let comments = await Comment.find({}).populate("user");
    if (!comments) {
      return res.status(404).json({message: "No comments"});
    }
    return res.status(200).json({comments});
  } catch (err) {
    return next(err);
  }
};

exports.createComment = [
  body("comment").trim().isLength({min: 1}).withMessage("You have left an empty comment"),

  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
        data: req.body,
      });
    }

    try {
      jwt.verify(req.token, secretkey, async (err, user, authData) => {
        const comment = new Comment({
          comment: req.body.comment,
          postId: req.params.postid,
          user: user.userId,
        });

        // Save the comment asynchronously
        await comment.save();

        // Update the associated post with the comment
        await Post.findOneAndUpdate({_id: req.params.postid}, {$push: {comment: comment}});

        res.status(200).json({message: "Comment saved", comment});
      });
    } catch (err) {
      res.status(400).json({err});
    }
  },
];

exports.updateLike = async (req, res, next) => {
  try {
    jwt.verify(req.token, secretkey, async (err, user, authData) => {
      let commentToLike = await Comment.find(
        {_id: req.body.commentid},
        {
          likeCount: 1,
          likes: {
            $elemMatch: {$eq: user.userId},
          },
        }
      );

      if (commentToLike[0].likes === undefined || commentToLike[0].likes.length == 0) {
        let result = await Comment.updateOne(
          {
            _id: req.body.commentid,
            likes: {$ne: user.userId},
          },
          {
            $inc: {likeCount: +1},
            $push: {likes: user.userId},
          }
        );
        return res.status(200).json({result: result, comment: commentToLike});
      } else {
        let result = await Comment.updateOne(
          {
            _id: req.body.commentid,
            likes: user.userId,
          },
          {
            $inc: {likeCount: -1},
            $pull: {likes: user.userId},
          }
        );
        return res.status(200).json({result: result, comment: commentToLike});
      }
    });
  } catch (err) {
    console.error("Error " + err);
  }
};
