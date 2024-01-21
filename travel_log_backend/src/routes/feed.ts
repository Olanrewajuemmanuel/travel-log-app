import { Request, Router } from "express";
import { check, validationResult } from "express-validator";
import { JwtPayload } from "jsonwebtoken";
import { Document, Error, Schema } from "mongoose";
import { upload } from "../fileUploadLogic";
import verifyToken from "../middlewares";
import FeedSchema from "../schemas/Feed";
import UserSchema from "../schemas/User";
import multer from "multer";

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
  async (req: Request, res: any) => {
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
  const allFeeds = await FeedSchema.find({})
    .sort("-dateModified")
    .populate("userId")
    .limit(20);

  const decoded = (req as any).token;
  const modifiedFeeds = allFeeds.map((feed) => {
    if (feed.userId == decoded.user && feed.userhasLiked) {
      // Owner has liked
      return {
        ...feed.toObject(),
        userhasLikedFeed: true,
      };
    } else if ((feed.allLikedUsers as any).indexOf(decoded.user) > -1) {
      // Current logged in user has liked
      return {
        ...feed.toObject(),
        userhasLikedFeed: true,
      };
    } else {
      return {
        ...feed.toObject(),
        userhasLikedFeed: false,
      };
    }
  });

  return res.send(modifiedFeeds);
});

// GET /feed/user --> UserFeedList
feedRouter.get("/:userId", verifyToken, async (req, res) => {
  const feed = await FeedSchema.find({ userId: req.params.userId });
  return res.send(feed);
});

// PATCH /feed/ --> UserFeedList
feedRouter.patch(
  "/:userId",
  check("rating").toInt(),
  check("caption").escape().trim(),
  verifyToken,
  async (req, res) => {
    const errors = validationResult(req.body);
    if (!errors.isEmpty())
      return res.status(400).json({ error: errors.array() });
    const feed = await FeedSchema.find({ userId: req.params.userId });
    if (!feed) return res.status(404).json({ message: "Log not found" });

    const saved = await FeedSchema.findByIdAndUpdate(feed, req.body);
    return res.json(saved);
  }
);

// PATCH /feed/ --> UserFeedList (Like)
feedRouter.patch("/like/:feedId", verifyToken, async (req, res) => {
  const feed: any = await FeedSchema.findById(req.params.feedId);
  if (!feed) return res.status(404).json({ message: "Log not found" });

  let userhasLikedFeed = false;
  const decoded = (req as any).token;

  if (feed.userhasLikedFeed) return res.json(feed); // Disallow liking more than once for owner
  const alreadyLiked = (
    feed.allLikedUsers as Array<Schema.Types.ObjectId>
  ).find((userId) => userId == decoded.user);
  if (alreadyLiked) return res.json(feed); // Disallow liking for users that have already liked

  if (decoded.user == feed.userId) userhasLikedFeed = true;

  feed.userhasLikedFeed = userhasLikedFeed;
  feed.likes++;
  feed.allLikedUsers = [...feed.allLikedUsers, decoded.user];
  const saved = await feed.save();
  return res.json(saved);
});

// PATCH /feed/ --> UserFeedList (Unlike)
feedRouter.patch("/unlike/:feedId", verifyToken, async (req, res) => {
  const feed: any = await FeedSchema.findById(req.params.feedId);
  if (!feed) return res.status(404).json({ message: "Log not found" });

  const decoded = (req as any).token;

  if (decoded.user == feed.userId && feed.userhasLikedFeed)
    feed.userhasLikedFeed = false;

  const alreadyLikedUsers = (
    feed.allLikedUsers as Array<Schema.Types.ObjectId>
  ).filter((userId) => userId != decoded.user);

  if (feed.likes > 0) feed.likes--;
  feed.allLikedUsers = alreadyLikedUsers;

  const saved = await feed.save();
  return res.json(saved);
});

export default feedRouter;
