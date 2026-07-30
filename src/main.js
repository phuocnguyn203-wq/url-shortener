import express from "express";
import errorHandler from "./app/middlewares/errorHandler.middleware.js";
import cookieParser from "cookie-parser";

import shortenerRouter from "./app/routes/shortener.route.js";
import userRouter from "./app/routes/users.route.js";

import dotenv from "dotenv";

dotenv.config();

const app = express();
export const PORT = 3000;

app.set("view engine", "ejs");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/shortened", shortenerRouter);
app.use("/users", userRouter);

app.use(errorHandler);

app.get("/", (req, res) => {
  res.send("hello, world");
});

async function start() {
  app.listen(PORT, function () {
    console.log(`Listening on http://127.0.0.1:${PORT}`);
  });
}

start();

