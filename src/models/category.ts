import mongoose from "mongoose";
import * as yup from "yup";

export const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
  },
  { timestamps: true }
);

const Category = mongoose.model("Category", categorySchema);

export default Category;

export async function validator(body: any) {
  const schema = yup.object({
    name: yup.string().required(),
    slug: yup.string().required(),
    description: yup.string().nullable(),
  });

  try {
    console.log(body);
    return await schema.validate(body);
  } catch (err) {
    return err;
  }
}
