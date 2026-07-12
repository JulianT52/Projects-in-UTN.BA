import express from "express";
import cors from "cors";
import router from "./routes/router.js";
import { errorHandler } from "./middlewares/errorHandler.js";

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: process.env.FRONTEND_URL
      ? process.env.FRONTEND_URL.split(",").map((o) => o.trim())
      : true,
  }),
);
app.use(router);
app.use(errorHandler);

export default app;
