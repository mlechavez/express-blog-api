import express, { Application } from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";

import postRoutes from "./routes/posts";
import categoryRoutes from "./routes/categories";
import authRoutes from "./routes/auth";

dotenv.config();

mongoose
  .connect(process.env.MONGODB_CONNSTRING!)
  .then(() => console.log(`Connected to mongodb`))
  .catch((err) => console.error(`Error connecting to mongodb ${err}`));

const app: Application = express();

app.use(cors());
app.use(express.json());

app.use("/api/posts", postRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);

app.listen(process.env.API_PORT, () =>
  console.log(`Connected to PORT ${process.env.API_PORT}`)
);
