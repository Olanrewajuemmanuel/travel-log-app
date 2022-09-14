import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { CustomRequest } from "../config/type";

function verifyToken(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.cookies.accessToken;

    if (!token) {
      throw new Error("Authorization not provided");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    (req as CustomRequest).token = decoded;

    next();
  } catch (err) {
    res.clearCookie("accessToken");
    return res.status(400).send(err);
  }
}

export default verifyToken;
