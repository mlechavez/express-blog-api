import mongoose from "mongoose";
import * as yup from "yup";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 50,
    },
    email: {
      type: String,
      required: true,
      minlength: 5,
      maxlength: 255,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 5,
      maxlength: 1024,
    },
    isAdmin: {
      type: Boolean,
    },
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);

export async function validator(body: any) {
  const schema = yup.object().shape({
    // userId: yup.string().required(),
    name: yup.string().required().min(3),
    email: yup.string().required().min(5).max(255),
    password: yup.string().required().min(5).max(1024),
  });

  try {
    return await schema.validate(body);
  } catch (err) {
    return err;
  }
}
