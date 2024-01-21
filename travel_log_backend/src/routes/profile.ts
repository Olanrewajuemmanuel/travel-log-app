import { Router, Request, Response, NextFunction } from "express";
import { CustomRequest } from "../config/type";
import { upload } from "../fileUploadLogic";
import verifyToken from "../middlewares";
import UserSchema from "../schemas/User";
import FeedSchema from "../schemas/Feed";

const profileRouter = Router();

profileRouter.get("/:username?", verifyToken, async (req, res, next) => {
  // check if username requested is equals to current user logged in

  const decoded = (req as any).token;

  let doc = null;

  if (!req.params.username) {
    // Default profile
    doc = await UserSchema.findById(decoded.user).select("-password -phone");
  } else {
    doc = await UserSchema.findOne({
      username: req.params.username,
    }).select("-password -phone");
  }

  if (!doc)
    return res.status(404).json({
      message: "Not found",
    });

  // Get feeds
  const feeds = await FeedSchema.find({ username: doc.username });

  return res.json({
    doc,
    feeds,
    currentUserProfile: doc.id === decoded.user,
  });
});

profileRouter.post(
  "/upload_pic",
  verifyToken,
  upload.single("profile_pic"),
  (req, res) => {
    if (!req.file) return res.status(204).end();
    // save to DB
    // get current user doc
    const userId = (req as any).token.user;
    const profilePicInfo = {
      file: req.file.filename,
    };
    UserSchema.findByIdAndUpdate(
      userId,
      { profile_pic: profilePicInfo },
      (err, doc) => {
        if (err) return res.status(404).send(err);
        return res.json({ ok: true, image: doc?.profile_pic });
      }
    );
  }
);

export default profileRouter;
