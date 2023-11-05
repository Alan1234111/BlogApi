const Tag = require("../models/tag");

exports.get_tags = async function (req, res, next) {
  try {
    const tags = await Tag.find({});
    if (!tags) {
      return res.status(404).json({err: "Tags not found"});
    }
    res.status(200).json({tags});
  } catch (err) {
    next(err);
  }
};

exports.create_tag = function (req, res, next) {
  const {name} = req.body;

  const tag = new Tag({name: name});

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
};
