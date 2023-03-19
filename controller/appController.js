import md5 from "md5";
import mongoose from "mongoose";
import { handleError, handleResponse } from "../handler/resHandler.js";
import { getAccessToken } from "../middleware/auth.js";
import { PostModel, validateNewPost } from "../models/post.js";
import { UserModel, validateLoginUser } from "../models/user.js";

const checkUserEmail = async (email) => {
  const result = await UserModel.findOne({ email: email }).lean();
  return result;
};

const checkUserWithID = async (id) => {
  const result = await UserModel.findById(id);
  return result;
};

export const registerUser = async (req, res) => {
  try {
    const userExist = await checkUserEmail(req.body.email);
    if (userExist) {
      return handleError({
        res,
        statusCode: 400,
        err_msg: "Email already registered.",
      });
    }

    req.body.password = md5(req.body.password);

    const user = await UserModel.create({ ...req.body });

    return handleResponse({
      res,
      data: user._id,
      msg: "User Created Successfully",
    });
  } catch (err) {
    return handleError({
      res,
      err: err,
    });
  }
};

export const authenticateUser = async (req, res) => {
  try {
    const { error } = await validateLoginUser(req.body);

    if (error) {
      return handleError({ res, err_msg: error.message });
    }

    const userData = await checkUserEmail(req.body.email);
    if (!userData) {
      return handleError({
        res,
        statusCode: 400,
        err_msg: "Email address is not registered",
      });
    }

    if (userData.password !== md5(req.body.password)) {
      return handleError({
        res,
        statusCode: 400,
        err_msg: "Invalid Credentials",
      });
    }

    const token = await getAccessToken(userData._id);

    return handleResponse({
      res,
      msg: "Login Successfully",
      data: token,
    });
  } catch (err) {
    return handleError({ res, err: err });
  }
};

export const followUser = async (req, res) => {
  try {
    const { id } = req.params;
    const isUserExist = await checkUserWithID(id);

    if (!isUserExist) {
      return handleError({
        res,
        statusCode: 400,
        err_msg: "User does not Exist",
      });
    }

    const data = await UserModel.findOneAndUpdate(
      {
        _id: req.userId,
      },
      {
        $addToSet: {
          following: id.toString(),
        },
      },
      {
        new: true,
        returnDocument: "after",
        projection: { password: 0 },
      }
    );

    return handleResponse({
      res,
      data: data,
      msg: "Followed",
    });
  } catch (err) {
    console.log("err: ", err);
    return handleError({ res, err: err });
  }
};

export const unfollowUser = async (req, res) => {
  try {
    const { id } = req.params;
    const isUserExist = await checkUserWithID(id);

    if (!isUserExist) {
      return handleError({
        res,
        statusCode: 400,
        err_msg: "User does not Exist",
      });
    }

    const userData = await checkUserWithID(req.userId);
    const match = userData.following.find((e) => e == id);
    if (match) {
      await UserModel.findByIdAndUpdate(req.userId, {
        $pull: { following: id },
      });
      return handleResponse({
        res,
        msg: `Requested id has been unfollowed.`,
      });
    }
    return handleError({
      res,
      msg: `requested id is not in your following list`,
    });
  } catch (err) {
    return handleError({ res, err: err });
  }
};

export const getProfile = async (req, res) => {
  try {
    const isExist = await checkUserWithID(req.userId);
    if (isExist) {
      const data = await UserModel.aggregate([
        {
          $match: {
            _id: isExist._id,
          },
        },
        {
          $addFields: {
            id: {
              $toString: "$_id",
            },
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "id",
            foreignField: "following",
            as: "followers",
          },
        },
        {
          $project: {
            username: 1,
            followers: {
              $size: "$followers",
            },
            following: {
              $size: "$following",
            },
          },
        },
      ]);
      return handleResponse({
        res,
        data: data[0],
        msg: "Profile get Successfully",
      });
    }
  } catch (err) {
    return handleError({ res, err: err });
  }
};

export const createPost = async (req, res) => {
  try {
    const { error } = await validateNewPost(req.body);
    if (error) {
      return handleError({ res, err_msg: error.message });
    }

    var newPost = new PostModel({
      title: req.body.title,
      description: req.body.description,
      createdBy: req.userId,
    });
    const data = await newPost.save();
    return handleResponse({
      res,
      msg: "Post created Successfully",
      data: {
        postID: data._id,
        title: data.title,
        description: data.description,
        createdTime: data.createdAt,
      },
    });
  } catch (err) {
    return handleError({ res, err: err });
  }
};

export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;

    const isExist = await PostModel.findOne({ _id: id, createdBy: req.userId });

    if (isExist) {
      const data = await PostModel.deleteOne({ _id: id });
      return handleResponse({
        res,
        msg: "Post deleted Successfully",
        data: data,
      });
    }
    return handleError({ res, err_msg: "Post not Exist" });
  } catch (err) {
    console.log("err: ", err);
    return handleError({ res, err: err.message });
  }
};

export const likePost = async (req, res) => {
  try {
    const { id } = req.params;

    const isExist = await PostModel.findOne({
      _id: id,
    });

    if (isExist) {
      await PostModel.findByIdAndUpdate(
        id,
        {
          $addToSet: { likes: req.userId.toString() },
        },
        {
          new: true,
          returnDocument: "after",
        }
      );
      return handleResponse({
        res,
        msg: "Post liked!!!",
      });
    }
    return handleError({ res, err_msg: "Post not Exist" });
  } catch (err) {
    return handleError({ res, err: err });
  }
};

export const unlikePost = async (req, res) => {
  try {
    const { id } = req.params;
    const isExist = await PostModel.findOne({
      _id: id,
    });

    const match = isExist?.likes.find((e) => e == req.userId);

    if (match) {
      await PostModel.findByIdAndUpdate(id, { $pull: { likes: req.userId } });
      return handleResponse({ res, msg: "Post unliked!!!" });
    } else {
      return handleError({
        res,
        err_msg: `Post is not liked by you`,
      });
    }
  } catch (err) {
    return handleError({ res, err: err });
  }
};

export const commentPost = async (req, res) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;
    const isExist = await PostModel.findOne({ _id: id });
    if (isExist) {
      const data = await PostModel.findByIdAndUpdate(
        id,
        {
          $push: {
            comments: { comment: comment, commentBy: req.userId },
          },
        },
        {
          returnDocument: "after",
        }
      );

      const newComment = data.comments[data.comments.length - 1];
      return handleResponse({
        res,
        data: newComment._id,
        msg: "Commented Successfully",
      });
    } else {
      return handleError({ res, err_msg: "Post doesn't Exist" });
    }
  } catch (err) {
    return handleError({ res, err: err });
  }
};

export const getPost = async (req, res) => {
  try {
    const { id } = req.params;
    const isExist = await PostModel.findOne({
      _id: id,
    });
    if (isExist) {
      const data = await PostModel.findOne(
        { _id: id },
        {
          _id: 1,
          likes: { $size: "$likes" },
          comments: { $size: "$comments" },
          title: 1,
          description: 1,
        }
      ).lean();
      return handleResponse({
        res,
        data: data,
        msg: "Post retrived Successfully",
      });
    }
    return handleError({ res, err_msg: "Post not found" });
  } catch (err) {
    return handleError({ res, err: err });
  }
};

export const getAllPost = async (req, res) => {
  try {
    const allPosts = await PostModel.find(
      { createdBy: req.userId },
      { _id: 1, title: 1, description: 1, createdAt: 1, likes: 1, comments: 1 }
    );
    return handleResponse({ res, data: allPosts, msg: "retrived all post" });
  } catch (err) {
    return handleError({ res, err: err });
  }
};
