import express, { Express, Request, Response, NextFunction } from "express";
import morgan, { StreamOptions } from "morgan";
import helmet from "helmet";
import cors from "cors";
import dotenv from "dotenv";
import { connect } from "mongoose";
import userRouter from "./routes/auth";
import feedRouter from "./routes/feed";
import profileRouter from "./routes/profile";
import multer from "multer";
import cookieParser from "cookie-parser";
import { expressjwt } from "express-jwt";
import path from "path";

dotenv.config();

const app: Express = express();

const PORT = process.env.PORT || 4000;
const isInProduction =
  process.env.NODE_ENV === "production";

async function initializeApp(app: Express) {
  if (isInProduction) {
    app.use(express.static("../Travel-log-frontend/build"));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "../Travel-log-frontend", "build", "index.html"));
    });
  }
  
  // middlewares
  app.use(morgan(`${isInProduction ? "combined" : "dev"}`));
  app.use(express.urlencoded({ extended: true, limit: "5mb" }));
  app.use(express.json());
  app.use(express.static("uploads"));

  app.use(
    cors({
      origin: "*",
      credentials: true,
    })
  );
  app.use(helmet());
  app.use(cookieParser());
  app.use(
    expressjwt({
      secret: process.env.JWT_SECRET as string,
      algorithms: ["HS256"],
      getToken: (req: any) => {
        return req.cookies.accessToken;
      },
    }).unless({
      path: [
        "/api/user/login",
        "/api/user/register",
        "/api/user/refresh",
        "/api/user/logout",
      ],
    })
  );
  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.json({
          message: "file is too large, max_size: 2MB",
        });
      }
    }
    res.status(500);
    res.send(err.stack);
  });

  //routes
  app.use("/api/user", userRouter);
  app.use("/api/feed", feedRouter);
  app.use("/api/profile", profileRouter);

  // connect to mongoDB
  try {
    const connection = await connect(process.env.MONGO_URI as string);
    if (connection) {
      return Promise.resolve("--- Mongo DB is connected ---");
    }
  } catch (err) {
    return Promise.reject(err);
  }
}
// TODO: Try, catch block for this!!

initializeApp(app)
  .then((res) => {
    console.log(res);
    // start server

    app.listen(PORT, () =>
      console.log(`Server is now running on port ${PORT}`)
    );
  })
  .catch((err) => console.log(err));
