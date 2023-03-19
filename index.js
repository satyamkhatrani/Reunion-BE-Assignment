import bodyParser from "body-parser";
import express, { json } from "express";
import mongoose from "mongoose";
import config from "./config/index.js";
import apiRoute from "./routes/index.js";

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(json());
app.use((req, res, next) => {
  res.setHeader(
    "Access-Control-Allow-Methods",
    "POST, PUT, OPTIONS, DELETE, GET"
  );
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.get("/check", (req, res) => {
  res.writeHead(200, { "Content-Type": "text/html" });
  res.write("<h2>Server is Running</h2>");
  res.end();
});

app.use("/api", apiRoute);

mongoose
  .connect(config.db.uri, config.db.options)
  .then(() => {
    app.listen(config.port);
    console.info(`server started on port ${config.port}`);
  })
  .catch((err) => {
    console.error(err);
  });

export default app;
