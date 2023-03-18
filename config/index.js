import { config } from "dotenv";

config();

export default {
  port: process.env.PORT,
  db: {
    uri: process.env.MONGODB_URI,
    options: {
      useNewUrlParser: true,
      readPreference: "primaryPreferred",
      useUnifiedTopology: true,
      useNewUrlParser: true,
    },
  },
  jwtSecret: process.env.JWT_SECRET,
  jwtExpireTime: process.env.JWT_EXP,
};
