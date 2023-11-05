const Post = require("../models/post");
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
  (req, res, next) => {
    if (!(req.body.tag instanceof Array)) {
      if (typeof req.body.tag === "undefined") req.body.tag = [];
      else req.body.tag = new Array(req.body.tag);
    }
    next();
  },

  function (req, res, next) {
    const {title, text} = req.body;
    console.log(req.file);

    const post = new Post({
      title,
      text,
      author: "Alan",
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
