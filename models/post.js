import Joi from "joi";
import mongoose from "mongoose";

const commentSchema = mongoose.Schema({
  comment: { type: String },
  commentBy: { type: mongoose.Types.ObjectId, ref: "users" },
});

const postSchema = new mongoose.Schema(
  {
    title: { type: String },
    description: { type: String, isUnique: true },
    createdBy: { type: mongoose.Types.ObjectId, ref: "users" },
    likes: { type: Array, default: [] },
    comments: [commentSchema],
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: true,
    },
  }
);

const PostModel = mongoose.model("posts", postSchema);

const validateNewPost = (body) => {
  const schema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
  });

  return schema.validate(body);
};

export { PostModel, validateNewPost };
