import mongoose from "mongoose";
import * as yup from "yup";

const postSchema = new mongoose.Schema(
  {
    author: {
      type: new mongoose.Schema({
        name: {
          type: String,
          required: true,
          minlength: 3,
          maxlength: 50,
        },
        email: {
          type: String,
          required: true,
        },
      }),
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    summary: {
      type: String,
      required: true,
    },
    content: {
      type: String,
    },
    published: {
      type: Boolean,
      default: false,
    },
    category: {
      type: new mongoose.Schema({
        name: {
          type: String,
          required: true,
        },
      }),
      required: true,
    },
  },
  { timestamps: true }
);

const Post = mongoose.model("Post", postSchema);

export default Post;

export async function validator(body: any) {
  const schema = yup.object().shape({
    userId: yup.string().required(),
    title: yup.string().required(),
    slug: yup.string().required(),
    image: yup.string().required(),
    summary: yup.string().required(),
    content: yup.string().required(),
    categoryId: yup.string().required(),
  });

  try {
    return await schema.validate(body);
  } catch (err) {
    return err;
  }
}
