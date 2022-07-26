import express, { Router, Request, Response } from "express";
import authorize from "../middlewares/authorize";
import validate from "../middlewares/validate";
import Category, { validator } from "../models/category";

const router: Router = express.Router();

router.post(
  "/",
  [authorize, validate(validator)],
  async (req: Request, res: Response) => {
    const category = await Category.findOne({ name: req.body.name.trim() });

    if (category)
      return res
        .status(400)
        .send({ success: false, message: "Category already exists." });

    const newCategory = new Category({
      name: req.body.name,
      slug: req.body.slug,
      description: req.body.description,
    });

    try {
      await newCategory.save();
      return res.send({ success: true, data: newCategory });
    } catch (err) {
      return res.status(500).send({ success: false, message: err });
    }
  }
);

router.get("/", async (req: Request, res: Response) => {
  try {
    const categories = await Category.find().sort({ createdAt: 1 });
    return res.send({ success: true, data: categories });
  } catch (err) {
    return res.status(500).send({ success: false, message: err });
  }
});

router.put(
  "/:id",
  [authorize, validate(validator)],
  async (req: Request, res: Response) => {
    try {
      const category = await Category.findByIdAndUpdate(
        req.params.id,
        {
          name: req.body.name,
          slug: req.body.slug,
          description: req.body.description,
        },
        { new: true }
      );

      if (!category)
        return res
          .status(404)
          .send({ success: false, message: "Could not find the given id." });

      return res.send({ success: true, data: category });
    } catch (err) {
      return res.status(500).send({ success: false, message: err });
    }
  }
);

router.delete("/:id", [authorize], async (req: Request, res: Response) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id, {
      new: true,
    });

    if (!category)
      return res
        .status(404)
        .send({ success: false, message: "Could not find the given id." });

    return res.send({ success: true, data: category });
  } catch (err) {
    return res.status(500).send({ success: false, message: err });
  }
});

export default router;
