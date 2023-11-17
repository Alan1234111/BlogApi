const Tag = require("../models/tag");
const Post = require("../models/post");
const { body, validationResult } = require("express-validator");

exports.get_tags = async function (req, res, next) {
  try {
    const tags = await Tag.find({});
    if (!tags) {
      return res.status(404).json({ err: "Tags not found" });
    }
    res.status(200).json({ tags });
  } catch (err) {
    next(err);
  }
};

exports.get_post_from_tag = async function (req, res, next) {
  try {
    const [posts, tag] = await Promise.all([
      Post.find({ tag: req.params.id }),
      Tag.findById(req.params.id),
    ]);

    res.status(200).json({ posts, tag });
  } catch (err) {
    next(err);
  }
};

exports.create_tag = [
  body("name")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Name is required"),

  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
        data: req.body,
      });
    }

    const { name } = req.body;

    const tag = new Tag({ name: name });

    tag
      .save()
      .then((result) => {
        res.status(201).json({
          message: "Created Tag successfully",
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
