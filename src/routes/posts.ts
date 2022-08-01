import express, { Router, Request, Response } from "express";
import authorize from "../middlewares/authorize";
import validate from "../middlewares/validate";
import Category from "../models/category";
import Post, { validator } from "../models/post";

const router: Router = express.Router();

router.post(
  "/",
  [authorize, validate(validator)],
  async (req: Request, res: Response) => {
    try {
      const category = await Category.findById(req.body.categoryId);

      if (!category)
        return res
          .status(400)
          .send({ success: false, message: "Invalid Category" });

      const user = (req as any).user;

      let post = new Post({
        author: {
          _id: user.id,
          name: user.name,
          email: user.email,
        },
        title: req.body.title,
        slug: req.body.slug,
        image: req.body.image,
        summary: req.body.summary,
        content: req.body.content,
        category: {
          _id: category._id,
          name: category.name,
        },
      });
      await post.save();

      return res.send({ success: true, data: post });
    } catch (err) {
      return res.status(500).send({ success: false, message: err });
    }
  }
);

router.get("/", async (req: Request, res: Response) => {
  let posts: any,
    pageNumber: number = 1,
    pageSize: number = 15,
    totalCount: number = 0;

  if (req.query.pageNumber && req.query.pageSize) {
    pageNumber = +req.query.pageNumber;
    pageSize = +req.query.pageSize;
  }
  // Regular expressions
  // ^ starts with
  // $ ends with
  // i at the end of regular expression stands for case insensitive
  // .* zero or more character or contains

  if (req.query.category) {
    posts = await Post.find({
      published: true,
      "category.name": {
        $regex: new RegExp(`.*${req.query.category}.*`),
        $options: "i",
      },
    })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .sort({ publishedDate: 1 });

    totalCount = await Post.find({
      published: true,
      "category.name": {
        $regex: new RegExp(`.*${req.query.category}.*`),
        $options: "i",
      },
    }).count();
  } else if (req.query.search) {
    posts = await Post.find({
      published: true,
      title: {
        $regex: new RegExp(`.*${req.query.search}.*`),
        $options: "i",
      },
    })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .sort({ publishedDate: 1 });

    totalCount = await Post.find({
      published: true,
      title: {
        $regex: new RegExp(`.*${req.query.search}.*`),
        $options: "i",
      },
    }).count();
  } else {
    posts = await Post.find({ published: true })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .sort({ publishedDate: 1 });

    totalCount = await Post.find({
      published: true,
    }).count();
  }

  return res.send({
    success: true,
    data: {
      pageNumber,
      pageSize,
      totalCount,
      posts,
    },
  });
});

router.get("/:id", async (req: Request, res: Response) => {
  if (!req.params.id)
    return res.status(400).send("Could not find the given id");

  const post = await Post.findById(req.params.id);

  if (!post) {
    return res.status(404).send({
      success: false,
      message: "The post with the given id was not found.",
    });
  }

  res.send({ success: true, data: post });
});

router.put(
  "/:id",
  [authorize, validate(validator)],
  async (req: Request, res: Response) => {
    if (!req.params.id)
      return res.status(404).send({
        success: false,
        message: "The post with the given id was not found",
      });

    const user = (req as any).user;
    if (user.id !== req.body.userId)
      return res.status(403).send({
        success: false,
        message: "You are not allowed to modify someone's post. ",
      });

    try {
      const category = await Category.findById(req.body.categoryId);

      if (!category)
        return res
          .status(400)
          .send({ success: false, message: "Invalid Category" });

      const post = await Post.findByIdAndUpdate(
        req.params.id,
        {
          author: {
            _id: user.id,
            name: user.name,
            email: user.email,
          },
          title: req.body.title,
          slug: req.body.slug,
          image: req.body.image,
          summary: req.body.summary,
          content: req.body.content,
          category: {
            _id: category._id,
            name: category.name,
          },
          published: req.body.published,
        },
        { new: true }
      );

      if (!post)
        return res.status(404).send({
          success: false,
          message: "The given post id was not found.",
        });

      return res.send({ success: true, data: post });
    } catch (err) {
      return res.status(500).send(err);
    }
  }
);

router.delete("/:id", [authorize], async (req: Request, res: Response) => {
  if (!req.params.id)
    return res
      .status(400)
      .send({ success: false, message: "Could not find the given id" });

  try {
    const post = await Post.findById(req.params.id);

    if (!post)
      return res.send({
        success: false,
        message: "The post with the given id was not found",
      });

    const user = (req as any).user;
    if (user.id !== req.body.userId)
      return res.status(403).send({ success: false, message: "Forbidden" });

    post.delete();

    return res.send({ success: true, post });
  } catch (err) {
    return res.status(500).send(err);
  }
});

export default router;
