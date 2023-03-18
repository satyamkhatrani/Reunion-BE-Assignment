import Joi from "joi";
import mongoose, { Schema } from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: { type: String },
    email: { type: String, isUnique: true },
    password: { type: String },
    following: { type: Array, default: [] },
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: true,
    },
  }
);

const validateLoginUser = (body) => {
  const Schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  });
  return Schema.validate(body);
};

const UserModel = mongoose.model("users", userSchema);

export { UserModel, validateLoginUser };
