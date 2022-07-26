import { Request, Response, NextFunction } from "express";

const validate = (validator: (body: any) => any) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await validator(req.body);
      if (result.errors) {
        return res.status(400).send({
          success: false,
          message: result.errors[0],
        });
      }

      next();
    } catch (err) {
      return res.status(500).send(err);
    }
  };
};

export default validate;
