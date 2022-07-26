import { Request, Response, NextFunction } from "express";

const admin = (req: Request, res: Response, next: NextFunction) => {
  if (!(req as any).user.isAdmin) return res.status(403).send("Forbidden");
  next();
};

export default admin;
