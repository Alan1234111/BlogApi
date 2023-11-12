const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PostSchema = new Schema(
  {
    title: {type: String, required: true},
    text: {type: String, required: true},
    author: {type: String, required: true},
    comment: [{type: Schema.Types.ObjectId, ref: "Comment"}],
    tag: {type: Schema.Types.ObjectId, ref: "Tag", required: true},
    photoUrl: {type: String, required: true},
    isPublished: {type: Boolean, required: true, default: false},
  },
  {timestamps: true}
);

module.exports = mongoose.model("Post", PostSchema);
