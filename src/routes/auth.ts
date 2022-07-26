import express, { Request, Response, Router } from "express";
import validate from "../middlewares/validate";
import { User, validator } from "../models/user";
import CryptoJS from "crypto-js";
import _ from "lodash";
import jwt from "jsonwebtoken";

const router: Router = express.Router();

router.post(
  "/register",
  [validate(validator)],
  async (req: Request, res: Response) => {
    let user = await User.findOne({ email: req.body.email });

    if (user)
      return res
        .status(400)
        .send({ success: false, message: "The email already exists." });

    user = new User({
      name: req.body.name,
      email: req.body.email,
      password: CryptoJS.AES.encrypt(
        req.body.password,
        process.env.CRYPTOJS_KEY!
      ).toString(),
    });

    try {
      await user.save();
      const createdUser = _.pick(req.body, ["_id", "name", "email"]);

      const token = jwt.sign(
        {
          id: user._id,
          email: user.email,
          name: user.name,
          isAdmin: user.isAdmin,
        },
        process.env.JWT_KEY!,
        {
          expiresIn: "1h",
        }
      );

      res.send({ success: true, data: { ...createdUser, token } });
    } catch (err) {
      return res.status(500).send(err);
    }
  }
);

router.post("/login", async (req: Request, res: Response) => {
  if (!req.body.email || !req.body.password)
    return res
      .status(400)
      .send({ success: false, message: "Email or password is required" });

  try {
    let user = await User.findOne({ email: req.body.email });

    if (!user)
      return res
        .status(400)
        .send({ success: false, message: "Email or password is invalid" });

    const decryptedPassword = CryptoJS.AES.decrypt(
      user.password,
      process.env.CRYPTOJS_KEY!
    ).toString(CryptoJS.enc.Utf8);

    if (decryptedPassword !== req.body.password)
      return res
        .status(400)
        .send({ success: false, message: "Email or password is incorrect." });

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        name: user.name,
        isAdmin: user.isAdmin,
      },
      process.env.JWT_KEY!,
      {
        expiresIn: "1h",
      }
    );

    const loggedInUser = _.pick(user, ["_id", "name", "email"]);

    res.send({ success: true, data: { ...loggedInUser, token } });
  } catch (err) {
    return res.status(500).send(err);
  }
});

export default router;
