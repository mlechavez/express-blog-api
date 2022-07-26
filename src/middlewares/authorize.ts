import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const authorize = (req: Request, res: Response, next: NextFunction) => {
  const authorizationHeader = req.headers["authorization"];
  const token = authorizationHeader?.split(" ")[1];

  if (!token)
    return res.status(401).send({ success: false, message: "Unauthorized" });

  jwt.verify(token, process.env.JWT_KEY!, (err, decoded) => {
    if (err)
      return res
        .status(401)
        .send({ success: false, message: "Token has expired" });

    (req as any).user = decoded;
    next();
  });
};

export default authorize;
