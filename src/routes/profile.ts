import { Router, Request, Response, NextFunction } from "express";
import { CustomRequest } from "../config/type";
import { upload } from "../fileUploadLogic";
import verifyToken from "../middlewares";
import UserSchema from "../schemas/User";

const profileRouter = Router();

profileRouter.get("/:username", verifyToken, async (req, res, next) => {
  // check if username requested is equals to current user logged in

  const decoded = (req as any).token;
  
  const doc = await UserSchema.findOne({ username: req.params.username }).select("-password -phone");
  if (!doc) return res.status(404).json({
    message: "Not found"
  });
  if (decoded && doc.id === decoded.user) {
    return res.json({
      doc,
      currentUserProfile: true
    })
  } else {
    res.json({doc})
  }
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
