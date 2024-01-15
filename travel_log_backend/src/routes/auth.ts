import { Router } from "express";
import { body, validationResult, check } from "express-validator";
import UserSchema from "../schemas/User";
import bcrypt from "bcryptjs";
import jwt, { JwtPayload } from "jsonwebtoken";
import { CustomRequest } from "../config/type";

const userRouter = Router();
interface Register {
  username: string | undefined;
  password1: string | undefined;
  passwordVerify: string | undefined;
  phone: string | undefined;
  lastName: string | undefined;
  firstName: string | undefined;
  profile_pic: string | undefined;
  email: string | undefined;
}
function setTokenCookies(access: string, refresh: string, req: any, res: any) {
  // save tokens in cookie
  res.cookie("accessToken", access);
  res.cookie("refreshToken", refresh, { httpOnly: true });
}

userRouter.post(
  "/register",
  check("username").trim(),
  check("password1").isLength({ min: 8 }),
  check("passwordVerify").isLength({ min: 8 }),
  check("lastName").trim().escape(),
  check("firstName").trim().escape(),
  check("email").trim().isEmail().normalizeEmail(),
  async (req, res) => {
    const { username, password1, passwordVerify, email }: Register = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    }
    // no validation errors
    // check if user already exists in DB
    const user =
      (await UserSchema.findOne({ email })) ||
      (await UserSchema.findOne({ username }));

    if (user)
      return res.status(400).json({
        message: "User already exists",
      });
    // if not, compare passwords and encrypt password
    if (!(password1 === passwordVerify))
      return res.status(400).json({
        message: "Passwords do not match",
      });
    const hashPassword = await bcrypt.hash(password1 as string, 10);
    // save info
    const newUser = new UserSchema(
      Object.assign(req.body, { password: hashPassword })
    );
    await newUser.save();

    // create token for user
    const token = jwt.sign(
      { user: newUser.id },
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" }
    );
    const refreshToken = jwt.sign(
      { user: newUser.id },
      process.env.JWT_REFRESH_TOKEN as string,
      { expiresIn: "3 days" }
    );

    // save tokens in cookie
    setTokenCookies(token, refreshToken, req, res);

    // Registration success
    return res.status(201).json({
      token,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
      },
    });
  }
);

userRouter.post(
  "/login",
  check("userOrEmail").trim(),
  check("password").isLength({ min: 8 }),
  async (req, res) => {
    const { userOrEmail, password } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ error: errors.array() });

    // check if user exists
    // check for phone or username
    const user = await UserSchema.findOne({
      $or: [{ username: userOrEmail }, { email: userOrEmail }],
    });
    if (!user)
      return res.status(404).json({
        message: "User does not exist",
      });
    // check and compare pass
    bcrypt.compare(password, user.password, (err, success) => {
      if (success) {
        //  send jwt token
        const token = jwt.sign(
          { user: user.id },
          process.env.JWT_SECRET as string,
          { expiresIn: "1h" }
        );
        const refreshtoken = jwt.sign(
          { user: user.id },
          process.env.JWT_REFRESH_TOKEN as string,
          { expiresIn: "3 days" }
        );
        // save tokens in cookie
        setTokenCookies(token, refreshtoken, req, res);

        // Login success
        return res.status(200).json({
          token,
          refreshtoken,
          user: {
            id: user.id,
            username: user.username,
            profile_pic: user.profile_pic,
            email: user.email,
          },
        });
      } else {
        return res.status(400).json({ message: "Username or password is incorrect." })
      }
    });
  }
);

userRouter.post("/logout", async (req, res) => {
  res.clearCookie("accessToken");
  return res.json({ message: "Logout Success" });
});

userRouter.post("/refresh", (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) return res.sendStatus(401);

  // verify access token
  jwt.verify(
    refreshToken,
    process.env.JWT_REFRESH_TOKEN as string,
    (err: any, decoded: any) => {
      if (err)
        return res
          .status(400)
          .json({ message: "Invalid token, Unauthorized!" });

      const accessToken = jwt.sign(
        {
          user: decoded.user,
        },
        process.env.JWT_SECRET as string,
        { expiresIn: "1h" }
      );

      // save newtoken in cookie
      setTokenCookies(accessToken, refreshToken, req, res);
      return res.json({ token: accessToken });
    }
  );
});

export default userRouter;
