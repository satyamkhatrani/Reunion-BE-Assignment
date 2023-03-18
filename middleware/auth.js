import jwt from "jsonwebtoken";
import config from "../config/index.js";
import { handleError } from "../handler/resHandler.js";

export const getAccessToken = async (userId) => {
  const data = { userId };
  return jwt.sign({ data }, config.jwtSecret, {
    expiresIn: config.jwtExpireTime,
  });
};

export const verifyAccessToken = async (req, res, next) => {
  try {
    let token =
      req.headers.Authorization ||
      req.headers.authorization ||
      req.headers["x-access-token"] ||
      req.header("token");

    if (!token) {
      return handleError({
        res,
        statusCode: 400,
        err_msg: "Please Login first.",
      });
    }

    token = token.split(" ")[1];
    try {
      const decoded = jwt.verify(token, config.jwtSecret);
      const { data } = decoded;
      req.userId = data.userId;
      return next();
    } catch (err) {
      return handleError({
        res,
        statusCode: error.statusCode ?? 500,
        err_msg: error.message || "Invalid Token",
      });
    }
  } catch (error) {
    return handleError({
      res,
      statusCode: error.statusCode ?? 500,
      err_msg: error.message,
    });
  }
};
