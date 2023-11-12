const Post = require("../models/post");
const Comment = require("../models/comment");
const Tag = require("../models/tag");
const {body, validationResulpt} = require("express-validator");

exports.get_posts = async function (req, res, next) {
  try {
    const posts = await Post.find({});
    if (!posts) {
      return res.status(404).json({err: "posts not found"});
    }
    res.status(200).json({posts});
  } catch (err) {
    next(err);
  }
};

exports.create_post = [
  function (req, res, next) {
    const {title, text, tag, isPublished} = req.body;

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
  },
];

exports.get_single_post = async function (req, res, next) {
  try {
    const post = await Post.findById(req.params.id).populate("comment").populate("tag").exec();
    console.log(post);

    if (!post) {
      return res.status(404).json({err: "post not found"});
    }
    res.status(200).json({post});
  } catch (err) {
    next(err);
  }
};

exports.update_single_post = async function (req, res, next) {
  try {
    const postId = req.params.id; // Get the post ID from the request parameters
    const {title, text, tag} = req.body;

    // Find the post by its ID
    const post = await Post.findById(postId).populate("tag").exec();

    if (!post) {
      return res.status(404).json({err: "Post not found"});
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
};

exports.delete_post = async (req, res) => {
  const postId = req.params.id;

  try {
    const deletedPost = await Post.findByIdAndDelete(postId);

    if (!deletedPost) {
      return res.status(404).json({message: "Post not found"});
    }

    res.json({message: "Post deleted successfully", deletedPost});
  } catch (error) {
    console.error(error);
    res.status(500).json({message: "Internal Server Error"});
  }
};
