const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CommentSchema = new Schema(
  {
    comment: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, ref: "User" },
    postId: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    likeCount: { type: Number, default: 0 },
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Comment", CommentSchema);
