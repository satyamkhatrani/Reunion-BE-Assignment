import express from "express";
import {
  authenticateUser,
  commentPost,
  createPost,
  deletePost,
  followUser,
  getAllPost,
  getPost,
  getProfile,
  likePost,
  registerUser,
  unfollowUser,
  unlikePost,
} from "../controller/appController.js";
import { verifyAccessToken } from "../middleware/auth.js";

const apiRoute = express.Router();

apiRoute.post("/register", registerUser);
apiRoute.post("/authenticate", authenticateUser);
apiRoute.post("/follow/:id", verifyAccessToken, followUser);
apiRoute.post("/unfollow/:id", verifyAccessToken, unfollowUser);
apiRoute.get("/user", verifyAccessToken, getProfile);
apiRoute.post("/posts", verifyAccessToken, createPost);
apiRoute.delete("/posts/:id", verifyAccessToken, deletePost);
apiRoute.post("/like/:id", verifyAccessToken, likePost);
apiRoute.post("/unlike/:id", verifyAccessToken, unlikePost);
apiRoute.post("/comment/:id", verifyAccessToken, commentPost);
apiRoute.get("/posts/:id", verifyAccessToken, getPost);
apiRoute.get("/all_posts", verifyAccessToken, getAllPost);

export default apiRoute;
