import { Request, Router } from "express";
import { check, validationResult } from "express-validator";
import { JwtPayload } from "jsonwebtoken";
import { Document, Error } from "mongoose";
import { upload } from "../fileUploadLogic";
import verifyToken from "../middlewares";
import FeedSchema from "../schemas/Feed";
import UserSchema from "../schemas/User";

const feedRouter = Router();

interface CustomRequest extends Request {
  token: JwtPayload;
}

// POST /feed/create --> newFeed
feedRouter.post(
  "/create",
  verifyToken,
  check("rating").toInt(),
  check("caption").escape().trim(),
  upload.array("images", 4),
  async (req, res) => {
    const errors = validationResult(req.body);
    if (!errors.isEmpty())
      return res.status(400).json({ error: errors.array() });
    const feedImgs = (req.files as any[]).map((file) => file.filename);

    // compile new feed
    const newFeed = Object.assign({}, req.body, {
      userId: (req as CustomRequest).token.user,
      imgSet: feedImgs,
    });

    // save doc
    const saved = await FeedSchema.create(newFeed);
    if (saved) return res.status(201).send(saved);
  }
);

// GET /feed --> AllFeeds
feedRouter.get("/", verifyToken, async (req, res) => {
  const allFeeds = await FeedSchema.find({}).sort("-dateModified");  
  
  return res.send(allFeeds);
});

// GET /feed/user --> UserFeedList
feedRouter.get("/:userId", verifyToken, async (req, res) => {
  const feed = await FeedSchema.find({ userId: req.params.userId });
  return res.send(feed);
});
export default feedRouter;
